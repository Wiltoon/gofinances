import React, { useState, useEffect, useCallback } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { VictoryPie } from 'victory-native';
import { addMonths, subMonths, format } from 'date-fns';

import { useAuth } from '../../hooks/auth';

import { useBottomTabBarHeight } from '@react-navigation/bottom-tabs';
import { useFocusEffect } from '@react-navigation/native';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components';
import { HistoryCard } from '../../components/HistoryCard';

import { 
    Container,
    Header,
    Title,
    ContentScroll,
    ChartContent,
    MonthSelect,
    MonthSelectButton,
    SelectIcon,
    Month,
    LoadContainer,

 } from './styles';

import { categories } from '../../utils/categories';

interface TransactionData {
    type: 'positive' | 'negative';
    name: string;
    price: string;
    category: string;
    date: string;
}

interface CategoryData {
    key: string;
    name: string;
    total: number;
    totalFormatted: string;
    color: string;
    percent: string;
}

export function Resume() {
    const [isLoading, setIsLoading] = useState(false);
    const [selectedDate, setSelectedDate] = useState(new Date());
    const [totalByCategories, setTotalByCategories] = useState<CategoryData[]>([]);

    const { user } = useAuth();
    const theme = useTheme();

    function handleDateChange(action: 'next' | 'prev') {
        if(action === 'next'){
            setSelectedDate(addMonths(selectedDate, 1));
        } else {
            setSelectedDate(subMonths(selectedDate, 1));
        }
    }

    async function loadData(){
        setIsLoading(true);
        const dataKey = `@gofinances:transactions_user:${user.id}`;
        const response = await AsyncStorage.getItem(dataKey);
        const responseFormatted = response ? JSON.parse(response) : [];

        const expensives = responseFormatted
        .filter((expensive: TransactionData) => 
            expensive.type === 'negative' && 
            new Date(expensive.date).getMonth() ===  selectedDate.getMonth() && 
            new Date(expensive.date).getFullYear() ===  selectedDate.getFullYear()
        );    

        const totalByCategory: CategoryData[] = [];

        const expesiveTotal = expensives
        .reduce((acummulator: number, expensive: TransactionData) => {
            return acummulator + Number(expensive.price);
        }, 0)

        categories.forEach(category => {
            let categorySum = 0;
            expensives.forEach((expensive: TransactionData) => {
                if (expensive.category === category.key){
                    categorySum += Number(expensive.price);
                }
                console.log(category)
            });
            
            if(categorySum > 0){
                const totalFormatted = `R$ ${categorySum.toFixed(2).toString().replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`
                console.log(totalFormatted);
                
                const percent = `${(categorySum / expesiveTotal * 100).toFixed(0)}%`;

                totalByCategory.push({
                    key: category.key,
                    name: category.name,
                    color: category.color,
                    total: categorySum,
                    totalFormatted,
                    percent
                });
            }
        });
        
        setTotalByCategories(totalByCategory);
        setIsLoading(false);
    }

    useFocusEffect(useCallback(() => {
        loadData();
    },[selectedDate]));


    return (
        <Container>
            <Header>
                <Title>Summary</Title>
            </Header>
            { 
                isLoading ? 
                <LoadContainer>
                    <ActivityIndicator 
                        color = {theme.colors.primary}
                        size = 'large'
                    />
                </LoadContainer> :
                <>
                <ContentScroll
                    vertical
                    contentContainerStyle = {{
                        paddingHorizontal: 24,
                        paddingBottom: useBottomTabBarHeight(),
                    }}
                >
                    <MonthSelect>
                        <MonthSelectButton onPress={() => handleDateChange('prev')}>
                            <SelectIcon name="chevron-left"/>
                        </MonthSelectButton>
                        <Month>
                            {format(selectedDate, "MMMM, yyyy")}
                        </Month>
                        <MonthSelectButton onPress={() => handleDateChange('next')}>
                            <SelectIcon name="chevron-right"/>
                        </MonthSelectButton>
                    </MonthSelect>

                    <ChartContent>
                        <VictoryPie
                            data = {totalByCategories}
                            colorScale = {totalByCategories.map(category => category.color)}
                            style = {{
                                labels: { 
                                    fontSize: RFValue(18),
                                    fontWeight: 'bold',
                                    fill: theme.colors.shapes
                                }
                            }}
                            labelRadius = {67}
                            x = "percent"
                            y = "total"
                        />
                    </ChartContent>

                    {
                        totalByCategories.map(item => ( 
                            <HistoryCard
                                key     =   {item.key}
                                title   =   {item.name}
                                amount  =   {item.totalFormatted}
                                color   =   {item.color}
                            />
                        ))
                    }
                </ContentScroll>
            </>
            }
        </Container>
    )
}

import React, { useCallback, useState, useEffect } from 'react';
import { ActivityIndicator } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

import { useFocusEffect } from '@react-navigation/native';
import { useTheme } from 'styled-components';

import { RFValue } from 'react-native-responsive-fontsize';
import { HighlightCard } from '../../components/HighlightCard';
import { TransactionCard } from '../../components/TransactionCard';

import { format } from 'date-fns';

import { 
    Container, 
    Header,
    UserWrapper,
    UserInfo,
    Photo,
    User,
    UserGreeting,
    UserName,
    Icon,
    HighlightCards,
    Transactions,
    Title,
    TransactionList,
    LogoutButton,
    LoadContainer,
} from './styles';

import { useAuth } from '../../hooks/auth';

export interface DataListProps extends Data{
    id: string;
}

interface HighlightProps {
    total: string;
    lastTransaction: string;
}

interface HighlightData {
    entries: HighlightProps;
    expensives: HighlightProps;
    capital: HighlightProps;
}

function getLastTransactionDate(
    collection: DataListProps[],
    type: 'positive' | 'negative',
    ){
        const collectionFiltered = collection
        .filter(item => item.type === type);

        if(collectionFiltered.length === 0) {
            return `No transactions.`
        }

        return format(new Date(Math.max.apply(Math, collectionFiltered
            .map(item => new Date(item.date).getTime())
        )),"dd/MM/yy");
}

export function Dashboard(){
    const [isLoading, setIsLoading] = useState(true);
    const [transactions, setTransactions] = useState<DataListProps[]>([]);
    const [highlightData, setHighlightData] = useState<HighlightData>(
        {
            entries: {
                total: 0,
                lastTransaction: '01/01/2001'
            },
            expensives: {
                total: 0,
                lastTransaction: '01/01/2001'
            },
            capital: {
                total: 0,
                lastTransaction: '01/01/2001'
            }
        } as HighlightData);

    const theme = useTheme();
    const { signOut, user } = useAuth();

    async function loadTransactions(){
        const dataKey = `@gofinances:transactions_user:${user.id}`;
        const response = await AsyncStorage.getItem(dataKey);
        const transactions = response ? JSON.parse(response) : [];

        let entriesTotal = 0;
        let expensiveTotal = 0;

        const transactionsFormatted: DataListProps[] = transactions
        .map((item: DataListProps) => {
            
            if(item.type === 'positive'){
                entriesTotal += Number(item.price);
            } else {
                expensiveTotal += Number(item.price);
            }

            const price = `R$ ${item.price.toFixed(2).toString().replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`;
            const date = format(new Date(item.date), "dd/MM/yy");
            console.log(date);
            return { 
                id: item.id,
                name: item.name,
                price,
                type: item.type,
                category: item.category,
                date,
            }
        });
        
        setTransactions(transactionsFormatted);
        const lastTransactionEntries = getLastTransactionDate(transactions, 'positive');
        const lastTransactionExpensives = getLastTransactionDate(transactions, 'negative');
        
        
        const total = entriesTotal - expensiveTotal;
        setHighlightData({
            entries: {
                total: `R$ ${entriesTotal.toFixed(2).toString().replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`,
                lastTransaction: `Last income: ${lastTransactionEntries}`,
            },
            expensives: {
                total: `R$ ${expensiveTotal.toFixed(2).toString().replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`,
                lastTransaction: `Last outcome: ${lastTransactionExpensives}`,
            },
            capital: {
                total: `R$ ${total.toFixed(2).toString().replace(".",",").replace(/\B(?=(\d{3})+(?!\d))/g, ".")}`,
                lastTransaction: `Last transaction: ${lastTransactionExpensives}`,
            }
        });
        setIsLoading(false);
    }

    useEffect(() => {
        loadTransactions();
    }, []);

    useFocusEffect(useCallback(() => {
        loadTransactions();
    },[]));

    return (
        <Container>
            { 
                isLoading ? 
                <LoadContainer>
                    <ActivityIndicator 
                        color = {theme.colors.primary}
                        size = 'large'
                    />
                </LoadContainer> :
                <>
                <Header>
                    <UserWrapper>
                        <UserInfo>
                            <Photo source={
                                {
                                    uri: user.photo 
                                }
                            }/>
                            <User>
                                <UserGreeting> Hello, </UserGreeting>
                                <UserName> {user.name} </UserName>
                            </User>
                        </UserInfo>
                        <LogoutButton onPress = {signOut}>
                            <Icon name="power"/>
                        </LogoutButton>
                    </UserWrapper>
                </Header>

                <HighlightCards > 
                    <HighlightCard
                        title = "Income"
                        amount = {highlightData.entries.total}
                        lastTransaction = {highlightData.entries.lastTransaction}
                        type = 'up'
                    />
                    <HighlightCard
                        title = "Outcome"
                        amount = {highlightData.expensives.total}
                        lastTransaction = {highlightData.expensives.lastTransaction}
                        type = 'down'
                    />
                    <HighlightCard 
                        title = "Balance"
                        amount = {highlightData.capital.total}
                        lastTransaction = {highlightData.capital.lastTransaction}
                        type = 'total'
                    />
                </HighlightCards>

                <Transactions>
                    <Title>Listing</Title>
                    <TransactionList
                        data = {transactions}
                        keyExtractor = {item => item.id}
                        renderItem = {({ item }) => <TransactionCard data={item}/>}
                    />
                </Transactions>
                </>
            }
        </Container>
    )
}
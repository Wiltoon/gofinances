import React, { useState } from 'react';
import { 
    Modal, 
    TouchableWithoutFeedback, 
    Keyboard,
    Alert,
} from 'react-native';
import * as Yup from 'yup';
import { yupResolver } from '@hookform/resolvers/yup';
import { useForm } from 'react-hook-form';
import { useAuth } from '../../hooks/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import uuid from 'react-native-uuid';
import { useNavigation } from '@react-navigation/native';

import { Button } from '../../components/Forms/Button';
import { InputForm } from '../../components/Forms/InputForm';
import { TransactionTypeButton } from '../../components/Forms/TransactionTypeButton';
import { CategorySelectButton } from '../../components/Forms/CategorySelectButton';

import { CategorySelect } from '../CategorySelect';

import { 
    Container,
    Header,
    Title,
    Form,
    Fields,
    TransactionTypes,
} from './styles';

interface FormData {
    name: string;
    price: string;
}

const schema = Yup.object().shape({
    name: Yup.string().required('Name is required'),
    price: Yup
        .number()
        .typeError('Type numeric error')
        .positive('Number negative invalid')
        .required('Price is required')
})

export function Register(){
    const [transactionType, setTransactionType] = useState('');
    const [categoryModalOpen, setCategoryModalOpen] = useState(false);

    const { user } = useAuth();

    const [category, setCategory] = useState({
        key: 'category',
        name: 'Category'
    });

    const navigation = useNavigation();

    const { 
        control,
        handleSubmit,
        reset,
        formState: { errors }
    } = useForm({
        resolver: yupResolver(schema),
    });

    function handleTransactionTypeSelect(type: 'positive'|'negative'){
        setTransactionType(type);
    }

    function handleCloseSelectCategory(){
        setCategoryModalOpen(false);
    }

    function handleOpenSelectCategory(){
        setCategoryModalOpen(true);
    }

    async function handleRegister(form: FormData){
        if(!transactionType)
            return Alert.alert('Select a Transaction type');

        if(category.key === 'category')
            return Alert.alert('Select a Category');
        
        
        const newTransaction = {
            id: String(uuid.v4()),
            name: form.name,
            price: form.price,
            type: transactionType,
            category: category.key,
            date: new Date()
        }
        
        try {
            const dataKey = `@gofinances:transactions_user:${user.id}`;
            const data = await AsyncStorage.getItem(dataKey);
            const currentData = data ? JSON.parse(data) : [];

            const dataFormatted = [
                ...currentData,
                newTransaction
            ];

            await AsyncStorage.setItem(dataKey, JSON.stringify(dataFormatted));

            reset();
            setTransactionType('');
            setCategory({
                key: 'category',
                name: 'Category'
            });

            navigation.navigate('Listing');
        } catch (error) {
            console.log(error);
            Alert.alert('Não foi possível salvar');
        }

    }

    return (
        <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
            <Container>     
                <Header>
                    <Title>Register</Title>
                </Header>
                <Form>
                    <Fields>
                        <InputForm 
                            name="name"
                            control={control}
                            placeholder="Name"
                            autoCapitalize="sentences"
                            autoCorrect = {false}
                            error = {errors.name && errors.name.message}
                        />
                        <InputForm 
                            name="price"
                            control={control}
                            placeholder="Price"
                            keyboardType="numeric"
                            error = {errors.price && errors.price.message}
                        />
                        <TransactionTypes>
                            <TransactionTypeButton 
                                type="up"
                                title="Income" 
                                onPress = {() => handleTransactionTypeSelect('positive')}
                                isActive = {transactionType === 'positive'}/>
                            <TransactionTypeButton 
                                type="down"
                                title="Outcome"
                                onPress = {() => handleTransactionTypeSelect('negative')}
                                isActive = {transactionType === 'negative'}/>
                        </TransactionTypes>
                        <CategorySelectButton 
                            title={category.name}
                            onPress = {handleOpenSelectCategory}
                        />
                    </Fields>
                    <Button 
                        title="Send"
                        onPress = {handleSubmit(handleRegister)}
                    />
                </Form>
                <Modal visible={categoryModalOpen}>
                    <CategorySelect
                        category={category}
                        setCategory = {setCategory}
                        closeSelectCategory = {handleCloseSelectCategory}
                    />
                </Modal>
           </Container>
        </TouchableWithoutFeedback>
    );
}
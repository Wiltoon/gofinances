import styled from 'styled-components/native';
import { TextInput } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';

export const Container = styled(TextInput)`
    width: 100%; 
    padding: 16px 18px;

    font-family: ${({ theme }) => theme.fonts.regular};
    font-size: ${RFValue(14)}px;

    color: ${({ theme }) => theme.colors.text_dark};
    background-color: ${({ theme }) => theme.colors.shapes};
    border-radius: 10px;
    
    margin-bottom: 8px;
`;

// export const Header = styled.View`
//     background-color: ${({ theme }) => theme.colors.primary};

//     width: 100%;
//     height: ${RFValue(113)}px;

//     align-items: center;
//     justify-content: flex-end;
//     padding-bottom: 19px;
// `;

// export const Title = styled.Text`
//     font-family: ${({ theme }) => theme.fonts.regular};
//     color: ${({ theme }) => theme.colors.shapes};
//     font-size: ${RFValue(18)}px;
// `;

import React, { useContext, useState } from 'react';
import { ActivityIndicator, Alert, Plataform } from 'react-native';
import AppleSvg from '../../assets/apple.svg';
import GoogleSvg from '../../assets/google.svg';
import LogoSvg from '../../assets/logo.svg';
import { RFValue } from 'react-native-responsive-fontsize';
import { useTheme } from 'styled-components';
import { useAuth } from '../../hooks/auth';

import { SignInSocialButton } from '../../components/SignInSocialButton';

import { 
    Container,
    Header,
    Title,
    TitleWrapper,
    SignInTitle,
    Footer,
    FooterWrapper,
} from './styles';

export function SignIn() {
    const [isLoading, setIsLoading] = useState(false);
    const { user, signInWithGoogle, signInWithApple, signOut, userStorageLoading } = useAuth();

    const theme = useTheme();

    async function handleSignInWithGoogle() {
        try { 
            setIsLoading(true);
            return await signInWithGoogle();

        } catch (error) {
            console.log(error);
            Alert.alert('Não foi possível conectar a conta Google');
            setIsLoading(false);
        } 
    }
    async function handleSignInWithApple() {
        try { 
            setIsLoading(true);
            return await signInWithApple();

        } catch (error) {
            console.log(error);
            Alert.alert('Não foi possível conectar a conta Apple');
            setIsLoading(false);
        } 
    }

    return (
        <Container>
            <Header>
                <TitleWrapper>
                    <LogoSvg
                        width= {RFValue(120)}
                        height= {RFValue(68)}
                    />
                    <Title>
                        Controle suas {'\n'}
                        finanças de forma {'\n'}
                        muito simples.
                    </Title>
                </TitleWrapper>

                <SignInTitle>
                    Faça seu Login
                </SignInTitle>
            </Header>
            <Footer>
                <FooterWrapper>
                    <SignInSocialButton
                        title="Login with Google"
                        svg={GoogleSvg}
                        onPress={handleSignInWithGoogle}
                    />
                    { 
                        Platform.OS === 'ios' &&
                        <SignInSocialButton
                            title="Login with Apple"
                            svg={AppleSvg}
                            onPress={handleSignInWithApple}
                        />
                    }
                </FooterWrapper>
                { isLoading && 
                    <ActivityIndicator 
                        color={theme.colors.shapes}
                        style={{ marginTop: 18}}
                    /> }
            </Footer>
        </Container>
    );
}

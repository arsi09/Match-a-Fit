import React, {useState} from 'react';
import {
  View, 
  Text, 
  TextInput,
  StyleSheet,
  ScrollView, 
  KeyboardAvoidingView, 
  Platform,
  Alert,
  TouchableOpacity
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';

const LoginScreen = ( { navigation }) => {
    const [email, setEmail] = useState ('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [error, setError] = useState('');

    const handleLogin = async () => {
        setError('');

        if (!email || !password)
        {
            setError('Email and password are required');
            return;
        }

    //Searches for past users by email using AsyncStorage
    try {
        const usersRaw = await AsyncStorage.getItem('matchafit_users');
        const users = usersRaw ? JSON.parse(usersRaw) : [];

        const user = users.find((u) => u.email === email);

        if (!user)
        {
            setError('Email is incorrect. Please try again.');
            return;
        }

        const decodedPassword = atob(user.password);
        if(decodedPassword !== password)
        {
            setError('Password is incorrect. Please try again.');
            return;
        }

        await AsyncStorage.setItem('matchafit_currentUser', JSON.stringify({
            id: user.id,
            username: user.username,
            email: user.email
        })
    );

    navigation.navigate('Home');
    } catch (err) {
        Alert.alert('Error', 'Something went wrong. Please try again.');
    }
    };

    return (
        <KeyboardAvoidingView 
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        >
        <ScrollView 
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
        >
            {/*Icon*/}
            <View style={styles.card}>
                <View style = {styles.iconCircle}>
                    <Text style = {styles.iconText}></Text>
                </View>

                {/*Headers for match-a-fit*/}
                <Text style={styles.title}>Match-a-Fit</Text>
                <Text style={styles.subtitle}>Welcome!</Text>

            {error ? (
                <View style = {styles.errorBox}>
                    <Text style = {styles.errorText}> {error}</Text>
                </View>
            ) : null}

            {/*Email*/}
            <Text style = {styles.label}>Email</Text>
            <TextInput
                style={styles.input}
                placeholder= "Please enter your email"
                placeholderTextColor="#aaa"
                value = {email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
            /> 
            
            {/*Password*/}
            <Text style = {styles.label}>Password</Text>
            <View style = {styles.passwordWrapper}>
                <TextInput
                    style={styles.passwordInput}
                    placeholder= "Please enter your password"
                    placeholderTextColor="#aaa"
                    value = {password}
                    onChangeText={setPassword}
                    secureTextEntry = {!showPassword}
                    autoCapitalize="none"
                />
                
                <TouchableOpacity 
                    onPress={() => setShowPassword(!showPassword)}
                    style={styles.eyeButton}
                >

                    <Text style={styles.eyeText}>{showPassword ? '🙈' : '👁️'}</Text>
                </TouchableOpacity>
            </View>

            {/*Login Button*/}
            <TouchableOpacity style = {styles.loginButton} onPress={handleLogin}>
                <Text style={styles.loginButtonText}>Login </Text>
            </TouchableOpacity>

            <TouchableOpacity
                onPress = {() => navigation.navigate('SignUp')}
                style = {styles.signupLink}
            >
                <Text style = {styles.signupText}>
                    Don't have an account? {''}
                    <Text style = {styles.signupTextBold}>Sign Up</Text>
                </Text>
            </TouchableOpacity>
        </View> 
        </ScrollView>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#daf0f7'
    },

    scrollContent: {
        flexGrow: 1,
        justifyContent: 'center',
        alignItems: 'center',
        padding: 16,
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 32,
        width: '100%',
        maxWidth: 420,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
        alignItems: 'center',
    },

    iconCircle: {
        width: 64,
        height: 64,
        borderRadius: 32,
        backgroundColor: '#4db8d4',
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 12,
    },
    iconText: {
        color: '#fff',
        fontSize: 26,
        fontWeight: 'bold',
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a2e',
        marginBottom: 24,
    },

    errorBox: {
        width: '100%',
        backgroundColor: '#fff0f0',
        borderColor: '#ffb3b3',
        borderWidth: 1,
        borderRadius: 10,
        padding: 12,
        marginBottom: 16,
    },

    errorText: {
        color: '#c0392b',
        fontSize: 14,
    },

    label: {
        alignSelf: 'flex-start',
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 6,
        marginTop: 8,
    },

    input: {
        width: '100%',
        borderWidth: 1.5,
        borderColor: '#d0e8f0',
        borderRadius: 10,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize: 14,
        color: '#1a1a2e',
        backgroundColor: '#fafdff',
        marginBottom: 4,
    },

    passwordWrapper: {
        width: '100%',
        flexDirection: 'row',
        alignItems: 'center',
        borderWidth: 1.5,
        borderColor: '#d0e8f0',
        borderRadius: 10,
        backgroundColor: '#fafdff',
        marginBottom: 4,
    },

    passwordInput: {
        flex: 1,
        paddingHorizontal: 14,
        paddingVertical: 12,
        fontSize:14,
        color: '#1a1a2e',
    },

    eyeButton: {
        paddingHorizontal: 12,
    },

    eyeText: {
        fontSize: 18,
    },

    loginButton: {
        width: '100%',
        backgroundColor: '#4db8d4',
        paddingVertical: 14,
        borderRadius: 12,
        alignItems: 'center',
        marginTop: 20,
        shadowColor: '#4db8d4',
        shadowOffset: {width:0, height: 4},
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },

    loginButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },

    signupLink: {
        marginTop: 20,
    },

    signupText: {
        fontSize: 14,
        color: '#666',
    },

    signupTextBold: {
        color: '#4db8d4',
        fontWeight: '600',
    },
});

export default LoginScreen; 
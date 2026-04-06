/**
 * Created by Brianna 3/30/26
 * UploadPhotoScreen.JS
 * Purpose:
 * - Handles UI for uploading a clothing item photo
 * - Collects photo, category, color, occasion from the user
 * - Delegates all backend logic to UploadPhotoController
 */

import React, { useState } from "react";
import {
  View, 
  Text, 
  StyleSheet,
  ScrollView, 
  KeyboardAvoidingView, 
  Image,
  Platform,
  ActivityIndicator,
  Alert,
  TouchableOpacity
} from 'react-native';
import * as ImagePicker from 'expo-image-picker';
import PhotoUploadController from '../../../Controllers/PhotoUploadController';

//Clothing categories and occasions for user selection
const CATEGORIES = ['Shirt', 'Pants', 'Dress', 'Shorts/Skirt','Jacket/Hoodie'];
const OCCASIONS = ['Formal', 'Formal Casual', 'Business Casual'];

//Reusable component for selecting category and occasion options
const OptionSelector = ({label, options, selected, onSelect}) => (
    <View style = {styles.selectorContainer}>

        <Text style = {styles.label}>{label}</Text>
        <View style = {styles.optionsRow}>
            {options.map((option) => (
                <TouchableOpacity
                key = {option}
                style = {[
                    styles.optionChip,
                    selected === option && styles.optionChipSelected,             
                ]}
                onPress={() => onSelect(option)}
            >
                <Text
                    style={[
                        styles.optionChipText,
                        selected === option && styles.optionChipTextSelected,
                    ]}
                >
                    {option}
                </Text>
            </TouchableOpacity>
        ))}
    </View>
</View> 
);

//Main screen component for photo upload flow
const PhotoUploadScreen = ({navigation}) => {
    const [step, setStep] = useState('instructions'); // 'instructions' | 'confirm' | 'details'
    
    const [photoUri, setPhotoUri] = useState(null);

    //state for category and occasion selections
    const [category, setCategory] = useState('');
    const [occasion, setOccasion] = useState('');

    //loading state for save operation
    const [saving, setSaving] = useState(false);

    //Calls controller to handle permissions and launch camera/library, then moves to confirm step if successful
    const handleTakePhoto = async () => {
        try { //request permissions and launch camera
            const uri = await PhotoUploadController.takePhoto();
            if (uri) {
                setPhotoUri(uri);
                setStep('confirm');
            }
        } catch (err) {
            Alert.alert('Permission Required', err.message);
        }
    };

    const handleUploadFromLibrary = async () => {
        try { //request permissions and launch image library
            const uri = await PhotoUploadController.pickFromLibrary();
            if (uri) {
                setPhotoUri(uri);
                setStep('confirm');
            }
        } catch (err) {
            Alert.alert('Permission Required', err.message);
        }
    };

    //Resets photo and goes back to instructions step
    const handleRetake = async () => {
        setPhotoUri(null);
        setStep('instructions');
    };

    //Called when users save item to closet, turns over all logic to controller which handles token retrieval and API calls - shows loading indicator while saving and alerts on success or error
    const handleSave = async () => {
    setSaving(true);
    try {
        await PhotoUploadController.saveClothingItem({ photoUri, category, occasion });
        Alert.alert('Success', 'Clothing item saved successfully to your closet!', [
            { text: 'OK', onPress: () => navigation.navigate('Home') },
        ]);
    } catch (err) {
        Alert.alert('Error', err.message || 'An error occurred while saving. Please try again.');
    } finally {
        setSaving(false);
    }
};

//Return the three main steps of the photo upload flow - instructions with photo options, confirm photo preview, and select details with save button - all wrapped in a scroll view with keyboard handling and a back button to return to home screen
return (
    <KeyboardAvoidingView
        style={styles.container}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
        <ScrollView
            contentContainerStyle={styles.scrollContent}
            keyboardShouldPersistTaps="handled"
        >
            {/*Back button to return to home screen*/}
            <TouchableOpacity style={styles.backButton} onPress={() => navigation.navigate('Home')}>
                <Text style={styles.backButtonText}>Back</Text>
            </TouchableOpacity>

            <View style={styles.card}>
                {/*SHows instructions/tips and photo upload options*/}
                {step === 'instructions' && (
                    <View style={styles.stepContainer}>
                        <View style = {styles.iconCircle}>
                            <Text style = {styles.iconText}>👕</Text>
                        </View> 

                        <Text style={styles.title}>Upload a Clothing Item</Text>

                        {/*Tip box that will be visible on the first step to help users take better photos of their clothing items*/}
                        <View style={styles.tipsBox}>
                            <Text style={styles.tipsTitle}>Tips for a Great Photo:</Text>
                            <Text style={styles.tipItem}>- Use good lighting (natural light is best)</Text>
                            <Text style={styles.tipItem}>- Capture the entire item in the frame</Text>
                            <Text style={styles.tipItem}>- Use a plain background if possible</Text>
                        </View>

                        {/*Two buttons for taking photo or uploading from library, which call respective handlers to launch camera or image picker*/}
                        <View style={styles.photoButtonRow}>
                            <TouchableOpacity style={styles.photoButton} onPress={handleTakePhoto}>
                                <Text style={styles.photoButtonText}>Take Photo</Text>
                            </TouchableOpacity>

                            <TouchableOpacity 
                            style={[styles.photoButton, styles.photoButtonSecondary]}
                            onPress={handleUploadFromLibrary}
                            >   
                                <Text style={styles.photoButtonText}>Upload from Library</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}

                {/*Shows photo preview and options to retake or confirm photo*/}
                {step === 'confirm' && (
                    <View style={styles.stepContainer}>
                        <Text style={styles.title}>Confirm Your Photo</Text>
                        {/*Shows photo preview*/}
                        {photoUri && ( 
                            <Image
                                source={{ uri: photoUri }}
                                style={styles.photoPreview}
                                resizeMode="cover"
                            />
                        )}

                        <View style={styles.confirmButtonsRow}>
                            <TouchableOpacity style={styles.retakeButton} onPress={handleRetake}>
                                <Text style={styles.retakeButtonText}>Retake?</Text>
                            </TouchableOpacity>
                            <TouchableOpacity style={styles.confirmButton} onPress={() => setStep('details')}>
                                <Text style={styles.confirmButtonText}>Looks Good!</Text>
                            </TouchableOpacity>
                        </View>
                    </View>
                )}
                {/*User selects category and occasion details for the item, then saves to closet - shows loading indicator while saving*/}
                {step === 'details' && (
                    <View style={styles.stepContainer}>
                        <Text style={styles.title}>Clothing Details</Text>

                        {photoUri && (
                            <Image
                                source={{ uri: photoUri }}
                                style={styles.photoThumbnail}
                                resizeMode="cover"
                            />
                        )}

                        <OptionSelector
                            label="Category"
                            options={CATEGORIES}
                            selected={category}
                            onSelect={setCategory}
                        />
                        <OptionSelector
                            label="Occasion"
                            options={OCCASIONS}
                            selected={occasion}
                            onSelect={setOccasion}
                        />

                        {/*Save button is disabled until both category and occasion are selected*/}
                        <TouchableOpacity 
                            style={[
                                styles.saveButton,
                                (!category || !occasion) && styles.saveButtonDisabled,
                            ]}
                            onPress={handleSave}
                            disabled={!category || !occasion || saving}
                        >
                            {saving ? (
                                <ActivityIndicator color="#fff" />
                            ) : (
                                <Text style={styles.saveButtonText}>Save to Closet 👗</Text>
                            )}
                        </TouchableOpacity>
                    </View>
                  )}

             </View>
         </ScrollView>
    </KeyboardAvoidingView>
    );
};

//Styles used for screen layout and components - clean and modern design with focus on usability
const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#daf0f7'
    },

    scrollContent: {
        flexGrow: 1,
        alignItems: 'center',
        padding: 16,
        paddingTop: 48,
    },

    backButton: {
        alignSelf: 'flex-start',
        marginBottom: 16,
    },

    backButtonText: {
        color: '#4db8d4',
        fontSize: 16,
        fontWeight: '600',
    },

    card: {
        backgroundColor: '#fff',
        borderRadius: 24,
        padding: 28,
        width: '100%',
        maxWidth: 420,
        shadowColor: '#000',
        shadowOffset: {width: 0, height: 8},
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 8,
    },

    stepContainer: {
        alignItems: 'center',
        width: '100%',
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
        fontSize: 28,
    },

    title: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#1a1a2e',
        marginBottom: 20,
        textAlign: 'center'
    },

    tipsBox: {
        backgroundColor: '#f0fafd',
        borderColor: '#b3e0e5',
        borderWidth: 1,
        borderRadius: 12,
        padding: 16,
        marginBottom: 24,
        width: '100%',
    },

    tipsTitle: {
        fontSize: 15,
        fontWeight: '700',
        color: '#1a1a2e',
        marginBottom: 10,
    },

    tipItem: {
        fontSize: 13,
        color: '#444',
        lineHeight: 20,
        marginBottom: 6,
    },

    photoButtonRow: {
        flexDirection: 'row',
        gap: 12,
        width: '100%',
    },

    photoButton: {
        flex: 1,
        backgroundColor: '#4db8d4',
        borderRadius: 14,
        paddingVertical: 18,
        alignItems: 'center',
        gap: 8,
    },

    photoButtonSecondary: {
        backgroundColor: '#569ab5',
    },

    photoButtonText: {
        color: '#fff',
        fontSize: 14,
        fontWeight: '600',
        textAlign: 'center',
    },

    photoPreview: {
        width: '100%',
        height: 300,
        borderRadius: 16,
        marginBottom: 20,
        backgroundColor: '#eee',
    },

    photoThumbnail: {
        width: 100,
        height: 100,
        borderRadius: 12,
        marginBottom: 20,
        backgroundColor: '#eee',
    },

    confirmButtonsRow: {
        flexDirection: 'row',
        gap: 16,
        width: '100%',
    },

    retakeButton: {
        flex: 1,
        borderWidth: 2,
        borderColor: '#ccc',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },

    retakeButtonText: {
        color: '#555',
        fontSize: 15,
        fontWeight: '600',
    },

    confirmButton: {
        flex: 1,
        backgroundColor: '#4db8d4',
        borderRadius: 12,
        paddingVertical: 14,
        alignItems: 'center',
    },

    confirmButtonText: {
        color: '#fff',
        fontWeight: '700',
        fontSize: 15,
    },

    selectorContainer: {
        width: '100%',
        marginBottom: 20,
    },

    label: {
        fontSize: 13,
        fontWeight: '600',
        color: '#333',
        marginBottom: 8,
    },

    optionsRow: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },

    optionChip: {
        paddingHorizontal: 14,
        paddingVertical: 8,
        borderRadius: 20,
        borderWidth: 1.5,
        borderColor: '#d0e8f0',
        backgroundColor: '#fafdff',
    },

    optionChipSelected: {
        backgroundColor: '#4db8d4',
        borderColor: '#4db8d4',
    },

    optionChipText: {
        fontSize: 13,
        color: '#555',
        fontWeight: '500',
    },

    optionChipTextSelected: {
        color: '#fff',
        fontWeight: '700',
    },

    saveButton: {
        width: '100%',
        backgroundColor: '#4db8d4',
        paddingVertical: 16,
        borderRadius: 14,
        alignItems: 'center',
        marginTop: 8,
        shadowColor: '#4db8d4',
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: 0.3,
        shadowRadius: 8,
        elevation: 4,
    },

    saveButtonDisabled: {
        backgroundColor: '#b0d8e8',
        shadowOpacity: 0,
        elevation: 0,
    },

    saveButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '700',
        letterSpacing: 0.5,
    },
});

export default PhotoUploadScreen;
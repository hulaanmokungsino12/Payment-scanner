import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function RegisterScreen() {
  const [name,setName]=useState(''); const [email,setEmail]=useState(''); const [password,setPassword]=useState(''); const [busy,setBusy]=useState(false);
  const submit=async()=>{
    const cleanName=name.trim(), cleanEmail=email.trim().toLowerCase();
    if(cleanName.length<2){Alert.alert('Name required','Enter your full name.');return;}
    if(!/^\S+@\S+\.\S+$/.test(cleanEmail)){Alert.alert('Invalid email','Enter a valid email address.');return;}
    if(password.length<8){Alert.alert('Password too short','Use at least 8 characters.');return;}
    setBusy(true);
    const {data,error}=await supabase.auth.signUp({email:cleanEmail,password,options:{data:{full_name:cleanName}}});
    setBusy(false);
    if(error){Alert.alert('Registration failed',error.message);return;}
    if(!data.session){Alert.alert('Check your email','Your account was created. Verify your email, then log in.');router.replace('/login');return;}
    Alert.alert('Account created','Your account has the Staff role by default. An admin must promote the business owner account to Admin.');
    router.replace('/dashboard');
  };
  return <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS==='ios'?'padding':undefined}><View style={styles.card}>
    <Text style={styles.brand}>The Crisostomos</Text><Text style={styles.title}>Create an account</Text><Text style={styles.subtitle}>New accounts are assigned Staff access by default.</Text>
    <Text style={styles.label}>Full name</Text><TextInput style={styles.input} value={name} onChangeText={setName} autoCapitalize="words" autoComplete="name" placeholder="Your full name" />
    <Text style={styles.label}>Email</Text><TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="you@example.com" />
    <Text style={styles.label}>Password (minimum 8 characters)</Text><TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry autoComplete="new-password" placeholder="Create a password" />
    <TouchableOpacity style={styles.primary} onPress={submit} disabled={busy}>{busy?<ActivityIndicator color="#fff"/>:<Text style={styles.primaryText}>Register</Text>}</TouchableOpacity>
    <TouchableOpacity onPress={()=>router.push('/login')}><Text style={styles.link}>Already have an account? Login</Text></TouchableOpacity>
    <TouchableOpacity onPress={()=>router.replace('/')}><Text style={styles.back}>Back to public page</Text></TouchableOpacity>
  </View></KeyboardAvoidingView>;
}
const styles=StyleSheet.create({safe:{flex:1,justifyContent:'center',backgroundColor:'#FFF9F1',padding:20},card:{width:'100%',maxWidth:480,alignSelf:'center',backgroundColor:'#fff',padding:24,borderRadius:22,borderWidth:1,borderColor:'#F0E3D4'},brand:{color:'#8A4B2A',fontWeight:'900',fontSize:15},title:{fontSize:29,fontWeight:'900',color:'#3B261C',marginTop:10},subtitle:{color:'#806B5D',marginTop:5,marginBottom:18,lineHeight:20},label:{fontWeight:'700',color:'#493426',marginBottom:7,marginTop:12},input:{borderWidth:1,borderColor:'#E5D8CA',borderRadius:12,paddingHorizontal:14,paddingVertical:13,color:'#30251E'},primary:{backgroundColor:'#6E3B22',borderRadius:12,padding:15,alignItems:'center',marginTop:22},primaryText:{color:'#fff',fontWeight:'800'},link:{textAlign:'center',color:'#8A4B2A',fontWeight:'700',marginTop:20},back:{textAlign:'center',color:'#8A887B',marginTop:16}});

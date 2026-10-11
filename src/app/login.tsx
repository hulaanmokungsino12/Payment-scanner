import React, { useState } from 'react';
import { ActivityIndicator, Alert, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { router } from 'expo-router';
import { supabase } from '@/lib/supabase';

export default function LoginScreen() {
  const [email,setEmail] = useState(''); const [password,setPassword] = useState(''); const [busy,setBusy] = useState(false);
  const submit = async () => {
    const cleanEmail=email.trim().toLowerCase();
    if (!cleanEmail || !/^\S+@\S+\.\S+$/.test(cleanEmail) || !password) { Alert.alert('Check your details','Enter a valid email address and password.'); return; }
    setBusy(true);
    const {error}=await supabase.auth.signInWithPassword({email:cleanEmail,password});
    setBusy(false);
    if(error){Alert.alert('Login failed',error.message);return;}
    router.replace('/dashboard');
  };
  return <KeyboardAvoidingView style={styles.safe} behavior={Platform.OS==='ios'?'padding':undefined}><View style={styles.card}>
    <Text style={styles.brand}>The Crisostomos</Text><Text style={styles.title}>Welcome back</Text><Text style={styles.subtitle}>Sign in to manage business orders.</Text>
    <Text style={styles.label}>Email</Text><TextInput style={styles.input} value={email} onChangeText={setEmail} autoCapitalize="none" keyboardType="email-address" autoComplete="email" placeholder="you@example.com" />
    <Text style={styles.label}>Password</Text><TextInput style={styles.input} value={password} onChangeText={setPassword} secureTextEntry autoComplete="password" placeholder="Enter your password" />
    <TouchableOpacity style={styles.primary} onPress={submit} disabled={busy}>{busy?<ActivityIndicator color="#fff"/>:<Text style={styles.primaryText}>Login</Text>}</TouchableOpacity>
    <TouchableOpacity onPress={()=>router.push('/register')}><Text style={styles.link}>Need an account? Register</Text></TouchableOpacity>
    <TouchableOpacity onPress={()=>router.replace('/')}><Text style={styles.back}>Back to public page</Text></TouchableOpacity>
  </View></KeyboardAvoidingView>;
}
const styles=StyleSheet.create({safe:{flex:1,justifyContent:'center',backgroundColor:'#FFF9F1',padding:20},card:{width:'100%',maxWidth:480,alignSelf:'center',backgroundColor:'#fff',padding:24,borderRadius:22,borderWidth:1,borderColor:'#F0E3D4'},brand:{color:'#8A4B2A',fontWeight:'900',fontSize:15},title:{fontSize:29,fontWeight:'900',color:'#3B261C',marginTop:10},subtitle:{color:'#806B5D',marginTop:5,marginBottom:22},label:{fontWeight:'700',color:'#493426',marginBottom:7,marginTop:12},input:{borderWidth:1,borderColor:'#E5D8CA',borderRadius:12,paddingHorizontal:14,paddingVertical:13,color:'#30251E'},primary:{backgroundColor:'#6E3B22',borderRadius:12,padding:15,alignItems:'center',marginTop:22},primaryText:{color:'#fff',fontWeight:'800'},link:{textAlign:'center',color:'#8A4B2A',fontWeight:'700',marginTop:20},back:{textAlign:'center',color:'#8A887B',marginTop:16}});

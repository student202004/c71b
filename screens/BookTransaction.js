import React from 'react';
import { Text, View, TouchableOpacity, StyleSheet,TextInput,Image,Alert } from 'react-native';
import * as Permissions from 'expo-permissions';
import { BarCodeScanner } from 'expo-barcode-scanner';
import firebase from 'firebase'
import db from '../config'

export default class TransactionScreen extends React.Component {
    constructor(){
      super();
      this.state = {
        hasCameraPermissions: null,
        scanned: false,
        scannedStudentId: '',
        scannedBookId:'',
        buttonState: 'normal'
      }
    }

    getCameraPermissions = async (id) =>{
      const {status} = await Permissions.askAsync(Permissions.CAMERA);
      
      this.setState({
        /*status === "granted" is true when user has granted permission
          status === "granted" is false when user has not granted the permission
        */
        hasCameraPermissions: status === "granted",
        buttonState: id,
        scanned: false
      });
    }

    handleBarCodeScanned = async({type, data})=>{
    const {buttonState}=this.state
    if (buttonState==="BookId"){
        this.setState({
            scanned: true,
            scannedBookId: data,
            buttonState: 'normal'
          });
    }
    else if (buttonState==="StudentId"){
        this.setState({
            scanned: true,
            scannedStudentId: data,
            buttonState: 'normal'
          });
    }
      
    }
    handleTransaction=async()=>{
      var transcationMessage
      db.collection("books").doc(this.state.scannedBookId).get()
      .then((doc)=>{
        console.log(doc.data());
        var book=doc.data();
        console.log(book)
        if(book.bookAvailability){
          this.initiateBookIssue();
          transcationMessage="BookIssued"
        }
        else {
          this.initiateReturn();
          transcationMessage="Book Returned"
        }
      })

    }
    initiateBookIssue=async()=>{
      db.collection("transaction").add({
        'studentId':this.state.scannedStudentId,
        'bookId':this.state.scannedBookId,
        'date': firebase.firestore.Timestamp.now().toDate(),
        'transactionType':"Issue"
      })
      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvailability':false
      })
      db.collection("student").doc(this.state.scannedStudentId).update({
        'numberOfBookIssued':firebase.fireStore.FieldValue.increment(1)
      })
      alert("Book Issued");
      this.setState({
        scannedBookId:'',
        scannedStudentId:'',
      })
    }
    initiateReturn=async()=>{
      db.collection("transcation").add({
        'studentId':this.state.scannedStudentId,
        'bookId':this.state.scannedBookId,
        'date': firebase.firestore.Timestamp.now().toDate(),
        'transactionType':"Return"
      })
      db.collection("books").doc(this.state.scannedBookId).update({
        'bookAvaibilty':true
      })
      db.collection("student").doc(this.state.scannedStudentId).update({
        'numberOfBookIssued':firebase.fireStore.FieldValue.increment(-1)
      })
      alert("Book Returned");
      this.setState({
        scannedBookId:'',
        scannedStudentId:'',
      })
    }
    render() {
      const hasCameraPermissions = this.state.hasCameraPermissions;
      const scanned = this.state.scanned;
      const buttonState = this.state.buttonState;

      if (buttonState !=="normal" && hasCameraPermissions){
        return(
          <BarCodeScanner
            onBarCodeScanned={scanned ? undefined : this.handleBarCodeScanned}
            style={StyleSheet.absoluteFillObject}
          />
        );
      }

      else if (buttonState === "normal"){
        return(
          <View style={styles.container}>
              <View>
                  <Image
                  source={require('../assets/bookl.jpg')}
                  style={{width:200,height:200}}
                  />
                  <Text style={{textAlign:'center',fontSize:30}}>Wily</Text>
              </View>
              <View style={styles.inputView}>
                  <TextInput style={styles.inputBox}
                    placeholder="Book Id"
                    onChangeText={(text) => this.setState({ scannedBookId: text })}
                    value={this.state.scannedBookId}
                  />
                  <TouchableOpacity style={styles.scanButton}
                  onPress={()=>{
                      this.getCameraPermissions("BookId")
                  }}>
                      <Text style={styles.buttonText}>
                        Scan
                      </Text>
                  </TouchableOpacity>
              </View>
              <View style={styles.inputView}>
                  <TextInput style={styles.inputBox}
                    placeholder="Student Id"
                    onChangeText={(text) => this.setState({ scannedStudentId: text })}
                    value={this.state.scannedStudentId}
                  />
                  <TouchableOpacity style={styles.scanButton}
                  onPress={()=>{
                      this.getCameraPermissions("StudentId")
                  }}>
                      <Text style={styles.buttonText}>
                        Scan
                      </Text>
                  </TouchableOpacity>
              </View>
              <View>
                  <TouchableOpacity style={styles.submitButton}
                  onPress={async () => {
                    this.handleTransaction();
                  }}>
                      <Text style={styles.submitButtonText}> Submit </Text>
                  </TouchableOpacity>
              </View>
          </View>
        );
      }
    }
  }


  const styles = StyleSheet.create({
    container: {
      flex: 1,
      justifyContent: 'center',
      alignItems: 'center'
    },
    displayText:{
      fontSize: 15,
      textDecorationLine: 'underline'
    },
    scanButton:{
      backgroundColor: '#2196F3',
      padding: 10,
      margin: 10
    },
    buttonText:{
      fontSize: 15,
      textAlign: 'center',
      marginTop: 10
    },
    inputView:{
      flexDirection: 'row',
      margin: 20
    },
    inputBox:{
      width: 200,
      height: 40,
      borderWidth: 1.5,
      borderRightWidth: 0,
      fontSize: 20
    },
    scanButton:{
      backgroundColor: '#66BB6A',
      width: 50,
      borderWidth: 1.5,
      borderLeftWidth: 0
    },
    submitButton:{
        backgroundColor:"black",
        width:100,
        height:50
    },
    submitButtonText:{
        padding:10,
        textAlign:'center',
        fontSize:20,
        fontWeight:"bold",
        color:"white"
    }
  });

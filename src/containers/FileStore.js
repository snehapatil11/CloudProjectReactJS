import React, { Component } from "react";
import { Redirect } from 'react-router';
import ReactTable from 'react-table';
import "react-table/react-table.css";
import "./FileStore.css";
import cognitoUtils from '../Utilities/CognitoDetails'

const uuidv4 = require('uuid/v4');

class FileStore extends Component {

    constructor(props) {
        super(props);    
        this.file = null;
        this.state = {
            description: "",
            props: [],
            apiResponse: "",
            isUserAdmin: false
        };
    }      
    handleFileChange = event => {
        this.file = event.target.files[0];
    }    
    handleSubmit = async event => {
        event.preventDefault();
        // S3FileUpload
        //     .uploadFile(this.file, config)
        //     .then(data => console.log(data))
        //     .catch(err => console.error(err))
        this.s3fileupload();
    }
    handleChange = event => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }

    

    s3fileupload(){
        const formData = new FormData();
        formData.append('file', this.file);
        const options = {
            method: 'POST',
            body: formData,
            headers: {
                'Content-Type': 'multipart/form-data'
            }
        };
        delete options.headers['Content-Type'];

        fetch('http://localhost:4001/api/fileupload', options)
        .then(response => {
            return response.json();
          }).then(jsonResponse => {
            console.log(jsonResponse.imageUrl);
            this.storefiledata(jsonResponse.imageUrl,jsonResponse.fileName);
          }).catch (error => {
            console.log(error)
          })
    }
    getFilesData() {
        fetch("http://localhost:4001/users")
        .then(response => response.json().then(filesdata =>{            
            this.setState({filesdata: filesdata})
            }));
    }
    
    storefiledata(imageurl, filename){
        const url="http://localhost:4001/postusers";
        fetch(url, {
            method: 'Post',
            body: JSON.stringify({
                "Id": uuidv4(),
                "Email": "SnehaOnkar",
                "FileName":filename,
                "FileDescription":this.state.description,
                "CreatedAt":new Date().toDateString() + " " + new Date().toLocaleTimeString(),
                "UpdatedAt":new Date().toDateString() + " " + new Date().toLocaleTimeString(),
                "Imageurl": imageurl,
            }),
            headers: {
                'Content-Type': 'application/json'
              }
        }).then(response => {
            console.log(response);
            this.getFilesData();
            this.setState({
                file: null,
                description: ""
            })
        });
    }
    
    componentDidMount(){

        this.props.userHasLoggedIn(true);

        var curUrl = window.location.href;
        cognitoUtils.parseCognitoWebResponse(curUrl).then((result) => {
            console.log("web response ::",result); // "Stuff worked!"
            cognitoUtils.getCognitoSession().then((result) => {
                console.log(result.user.userName);
                const grp=result.user.groups;
                if(grp){            
                    if(grp.includes("AdminGroup")){
                        this.setState({
                            isUserAdmin: true
                        })
                    }
                }
            });   
          }, function(err) {
            console.log(err); // Error: "It broke"
          });
        
        this.getFilesData();
    }
    
    deleteFile(fileId, fileName){
        console.log("fileId to be deleted" , fileName);
        const url="http://localhost:4001/api/filedelete";
        fetch(url, {
            method: 'Post',
            body: JSON.stringify({
                "fileName": fileName
            }),
            headers: {
                'Content-Type': 'application/json'
              }
        }).then(response => {
            this.deleteFileData(fileId);

        });
    }
    deleteFileData(fileId){
        return fetch('http://localhost:4001/deletefiledata' + '/' + fileId, {
            method: 'delete'
          }).then(response =>
            response.json().then(json => {
                console.log(json);
                this.getFilesData();
              return json;
            })
          );
    }
    render() {

        const columns=[
            {
                Header: "User Name",
                accessor: "Email"
            },
            {
                Header: "User Email",
                accessor: "Imageurl"
            },
            {
                Header: "File Name",
                accessor: "FileName"
            },
            {
                Header: "File Description",
                accessor: "FileDescription"
            },
            {
                Header: "File Upload Time",
                accessor: "CreatedAt"
            },
            {
                Header: "File Update Time",
                accessor: "UpdatedAt"
            },
            {
                Header: "Action",
                Cell: props =>{
                    return(
                        <a href="https://cloudstoragebucket1.s3.us-east-2.amazonaws.com/rose_bud_orange_125198_168x300.jpg">Download!</a>
                    )
                }
            },
            {
                Header: "Action",
                Cell: props =>{
                    return(
                        <button 
                        onClick={()=>
                        this.deleteFile(props.original.Id, props.original.FileName)
                        //this.deleteFileData(props.original.id, props.original.Email)
                        }>Delete</button>
                    )
                }
            }
        ];
        if(this.state.isUserAdmin){
            return <Redirect to="/AdminPanel" />
        }
        return (
          <div className="FileStore">
            <div className="row">
                <div className="col-md-2"> Choose a file </div>
                <div className="col-md-10">
                    <input type="file" onChange={this.handleFileChange}></input>
                </div>
            </div>
            <div className="row">
                <div className="col-md-2"> Description </div>
                <div className="col-md-10">
                    <input type="text" id="description" onChange={this.handleChange} style={{float: "left"}} 
                    />
                </div>
            </div>
            <div className="row">
                <div className="col-md-2"></div>
                <div className="col-md-10">
                    <button variant="primary" class="btn btn-primary" style={{float: "left"}} type="button" onClick={this.handleSubmit}>
                    Upload
                    </button>  
                </div>
            </div>
            <div className="row">   </div>
            <div className="row">
            <p className="App-intro">.</p>
            </div>
            <div className="row">
                <ReactTable
                columns={columns}
                data={this.state.filesdata}
                defaultPageSize={5}
                className="-striped -highlight"
                >
                </ReactTable>
            </div>
        </div>
          
        );
      }
}
  
  export default FileStore;
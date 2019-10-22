import React, { Component } from "react";
import { Redirect } from 'react-router';
import ReactTable from 'react-table';
import "react-table/react-table.css";
import "./FileStore.css";
import cognitoUtils from '../Utilities/CognitoDetails'
//import appconfig from '../Config/appconfig'
import { fileServices } from '../services/fileServices'

class FileStore extends Component {

    constructor(props) {
        super(props);    
        this.file = null;
        this.state = {
            description: "",
            props: [],
            apiResponse: "",
            isUserAdmin: false,
            userName:"",
            userEmail:""
        };
    }      
    handleFileChange = event => {
        this.file = event.target.files[0];
    }    
    handleSubmit = async event => {
        event.preventDefault();
        this.s3fileupload();
    }
    handleChange = event => {
        this.setState({
            [event.target.id]: event.target.value
        });
    }
    componentDidMount(){
        this.props.userHasLoggedIn(true);
        
        var curUrl = window.location.href;
        cognitoUtils.parseCognitoWebResponse(curUrl).then((result) => {
            //console.log("web response ::",result); // "Stuff worked!"
            cognitoUtils.getCognitoSession().then((result) => {
                console.log("set1", result.user.email);
                this.setState({
                    userName: result.user.userName,
                    userEmail: result.user.email
                },function(){
                    this.getFilesData();
                })
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
            console.log(err);
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
            this.storefiledata(jsonResponse.imageUrl,jsonResponse.fileName, this.state.userName, this.state.userEmail, this.state.description);
          }).catch (error => {
            console.log(error)
          })
    }
    getFilesData() {
        fileServices.getFilesData(this.state.userEmail).then(filesdata =>{    
            console.log(filesdata);        
            this.setState({filesdata: filesdata})
        });
    }
    
    storefiledata(imageurl, filename, username, email, description){
        fileServices.storefiledata(imageurl, filename, username, email, description)
        .then(response => {
            console.log(response);
            this.getFilesData();
            this.setState({
                file: null,
                description: ""
            })
        });
    }
    
    deleteFile(fileId, fileName){
        fileServices.deleteFile(fileId, fileName)
        .then(response => {
            this.deleteFileData(fileId);
        })
    }
    deleteFileData(fileId){
        fileServices.deleteFileData(fileId)
        .then(res =>{
            this.getFilesData();
        })
    }
    fileDownload(fileName){
        //var appconfig = JSON.parse(localStorage.getItem("appConfig"));
        const filePath = process.env.REACT_APP_cloudFrontDomainName + '/' + fileName;
        console.log(filePath);
        //window.open(filePath, "_blank")
        var xhr = new XMLHttpRequest();
        xhr.open("GET", filePath, true);
        xhr.responseType = "blob";
        xhr.onload = function(){
            var urlCreator = window.URL || window.webkitURL;
            var imageUrl = urlCreator.createObjectURL(this.response);
            var tag = document.createElement('a');
            tag.href = imageUrl;
            tag.download = fileName;
            document.body.appendChild(tag);
            tag.click();
            document.body.removeChild(tag);
        }
        xhr.send();
    }
    render() {

        const columns=[
            {
                Header: "User Name",
                accessor: "UserName"
            },
            {
                Header: "User Email",
                accessor: "Email"
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
                        <button type="submit" onClick={()=> this.fileDownload(props.original.FileName)
                        }>Download</button>
                        //<a target="_blank" role="button" href="${appConfig.cloudFrontDomainName}/{props.original.FileName}" download>Download!</a>
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
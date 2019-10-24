import React, { Component } from "react";
import { Link } from "react-router-dom";
import { Nav, Navbar, NavItem } from "react-bootstrap";
import Routes from "./Routes";
import "./App.css";
import cognitoUtils from './Utilities/CognitoDetails'

class App extends Component {
  constructor(props) {
    super(props);
  
    this.state = {
      isUserLoggedIn: false
    };
  }
  
  userHasLoggedIn = LoggedIn => {
    this.setState({ isUserLoggedIn: LoggedIn });
  }

  onLogOut = (e) => {
    e.preventDefault()
    cognitoUtils.signOutCognitoSession()
  }

  render() {

  const childProps = {
    isUserLoggedIn: this.state.isUserLoggedIn,
    userHasLoggedIn: this.userHasLoggedIn
  };
    
    return (
      <div className="App container">
        <Navbar fluid collapseOnSelect style={{backgroundColor: "#85c1e9"}}>
          <Navbar.Header>
            <Navbar.Brand>
              <Link to="/">StorePot</Link>
            </Navbar.Brand>
            <Navbar.Toggle />
          </Navbar.Header>
          
          <Navbar.Collapse>
            <Nav pullRight>
            {
              this.state.isUserLoggedIn
            ? <NavItem onClick={this.onLogOut}>Logout</NavItem>
            : (<NavItem href={cognitoUtils.getCognitoSignInUri()}>Sign In</NavItem>)
            }
            </Nav>
          </Navbar.Collapse>
        </Navbar>
        <Routes childProps={childProps} />
      </div>
    );
  }  
}

export default App;

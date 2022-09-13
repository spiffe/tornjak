import React, { Component } from 'react';
import TornjakHelper from './tornjak-helper';
import AccessNotAllowed from './AccessNotAllowed'
import { connect } from 'react-redux';
import { RootState } from 'redux/reducers';

type RenderOnAdminRoleProp = {
    // updated user roles
    globalUserRoles: string[],
    children: React.ReactNode
  }
  
  type RenderOnAdminRoleState = {}

class RenderOnAdminRole extends Component<RenderOnAdminRoleProp, RenderOnAdminRoleState> {
    TornjakHelper: TornjakHelper;
    constructor(props: RenderOnAdminRoleProp) {
        super(props);
        this.TornjakHelper = new TornjakHelper(props);
        this.state = {};
    }

    render() {
        return (
            <div>
                {this.TornjakHelper.checkRolesAdminUser(this.props.globalUserRoles) &&
                    this.props.children
                }
                {!this.TornjakHelper.checkRolesAdminUser(this.props.globalUserRoles) &&
                    <AccessNotAllowed />
                }
            </div>
        );
    }
}

const mapStateToProps = (state: RootState) => ({
    globalUserRoles: state.auth.globalUserRoles,
  })
  
  export default connect(
    mapStateToProps,
    {}
  )(RenderOnAdminRole)
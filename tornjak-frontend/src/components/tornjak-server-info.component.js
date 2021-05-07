import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Accordion, AccordionItem, Tag } from "carbon-components-react";
import IsManager from './is_manager';
import TornjakApi from './tornjak-api-helpers';
import {
  serverSelectedFunc,
  serverInfoUpdateFunc,
  tornjakServerInfoUpdateFunc,
  tornjakMessegeFunc,
} from 'actions';

const pluginTagColorMapper = {
    "NodeAttestor": "red",
    "WorkloadAttestor": "green",
    "KeyManager": "cyan",
    "NodeResolver": "blue",
    "Notifier": "teal",
    "DataStore": "purple",
}

const PluginTags = props => (
    <p>{ props.names.map(v=><Tag type={pluginTagColorMapper[props.type]} >{props.type + ": " + v}</Tag>)}</p>
)
const TornjakServerInfoDisplay = props => (
  <Accordion>
  <AccordionItem title="Trust Domain" open="true">
    <p>
    {props.tornjakServerInfo.trustDomain}
    </p>
  </AccordionItem>
  <AccordionItem title="Plugins" open="true">
    <table>
      {
          Object.entries(props.tornjakServerInfo.plugins).map(([key,value]) =>
              <tr><PluginTags type={key} names={value}/></tr>)
      }
    </table>
  </AccordionItem>
  <AccordionItem title="Verbose Config (click to expand)">
    <pre>
      { props.tornjakServerInfo.verboseConfig }
    </pre>
  </AccordionItem>
  </Accordion>
)

class TornjakServerInfo extends Component {
  constructor(props) {
    super(props);
    this.TornjakApi = new TornjakApi();
    this.state = {};
  }

  componentDidMount() {
    if (IsManager) {
      if (this.props.globalServerSelected !== "") {
        this.TornjakApi.populateTornjakServerInfo(this.props.globalServerSelected, this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessegeFunc);
      }
    } else {
      this.TornjakApi.populateLocalTornjakServerInfo(this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessegeFunc);
    }
  }

  componentDidUpdate(prevProps) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.TornjakApi.populateTornjakServerInfo(this.props.globalServerSelected, this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessegeFunc)
      }
    } 
  }

  tornjakServerInfo() {
    if (this.props.globalTornjakServerInfo === "") {
      return ""
    } else {
      return <TornjakServerInfoDisplay tornjakServerInfo={this.props.globalTornjakServerInfo} />
    }
  }

  render() {
    return (
      <div>
        <h3>Server Info</h3>
        {this.props.globalErrorMessege !== "OK" &&
          <div className="alert-primary" role="alert">
            <pre>
              {this.props.globalErrorMessege}
            </pre>
          </div>
        }
        {IsManager}
        <br /><br />
        {this.tornjakServerInfo()}
      </div>
    )
  }
}

const mapStateToProps = (state) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalServerInfo: state.servers.globalServerInfo,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessege: state.tornjak.globalErrorMessege,
})

export default connect(
  mapStateToProps,
  { serverSelectedFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc, tornjakMessegeFunc }
)(TornjakServerInfo)

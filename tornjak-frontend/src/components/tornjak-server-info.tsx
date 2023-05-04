import React, { Component } from 'react';
import { connect } from 'react-redux';
import { Accordion, AccordionItem, Tag, TagTypeName } from "carbon-components-react";
import IsManager from './is_manager';
import TornjakApi from './tornjak-api-helpers';
import {
  serverSelectedFunc,
  serverInfoUpdateFunc,
  tornjakServerInfoUpdateFunc,
  tornjakMessageFunc,
} from 'redux/actions';
import { RootState } from 'redux/reducers';

import {
  TornjakServerInfo as TornjakServInfo,
} from './types';

const pluginTagColorMapper: { [key: string]: TagTypeName | undefined; } = {
  "NodeAttestor": "red",
  "WorkloadAttestor": "green",
  "KeyManager": "cyan",
  "NodeResolver": "blue",
  "Notifier": "teal",
  "DataStore": "purple",
}

type TornjakServerInfoProp = {
  // dispatches a payload for the tornjak server info of the selected server and has a return type of void
  tornjakServerInfoUpdateFunc: (globalTornjakServerInfo: TornjakServInfo) => void,
  // dispatches a payload for an Error Message/ Success Message of an executed function as a string and has a return type of void
  tornjakMessageFunc: (globalErrorMessage: string) => void,
  // the selected server for manager mode 
  globalServerSelected: string,
  // tornjak server info of the selected server
  globalTornjakServerInfo: TornjakServInfo,
  // error/ success messege returned for a specific function
  globalErrorMessage: string,
}

type TornjakServerInfoState = {}

const PluginTags = (props: { names: string[], type: string }) => (
  <p>{props.names.map((v: string) => <Tag type={pluginTagColorMapper[props.type]} >{props.type + ": " + v}</Tag>)}</p>
)
const TornjakServerInfoDisplay = (props: { tornjakServerInfo: TornjakServInfo }) => (
  <Accordion>
    <AccordionItem title="Trust Domain" open>
      <p>
        {props.tornjakServerInfo.trustDomain}
      </p>
    </AccordionItem>
    <AccordionItem title="Plugins" open>
      <table>
        {
          (props.tornjakServerInfo.plugins &&
            Object.entries(props.tornjakServerInfo.plugins).map(([key, value]) =>
              <tr key={key + ":" + value}><PluginTags type={key} names={value} /></tr>)
          )
        }
      </table>
    </AccordionItem>
    <AccordionItem title="Verbose Config (click to expand)">
      <pre>
        {props.tornjakServerInfo.verboseConfig}
      </pre>
    </AccordionItem>
  </Accordion>
)

class TornjakServerInfo extends Component<TornjakServerInfoProp, TornjakServerInfoState> {
  TornjakApi: TornjakApi;
  constructor(props: TornjakServerInfoProp) {
    super(props);
    this.TornjakApi = new TornjakApi(props);
    this.state = {};
  }

  componentDidMount() {
    if (IsManager) {
      if (this.props.globalServerSelected !== "") {
        this.TornjakApi.populateTornjakServerInfo(this.props.globalServerSelected, this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
      }
    } else {
      this.TornjakApi.populateLocalTornjakServerInfo(this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc);
    }
  }

  componentDidUpdate(prevProps: TornjakServerInfoProp) {
    if (IsManager) {
      if (prevProps.globalServerSelected !== this.props.globalServerSelected) {
        this.TornjakApi.populateTornjakServerInfo(this.props.globalServerSelected, this.props.tornjakServerInfoUpdateFunc, this.props.tornjakMessageFunc)
      }
    }
  }

  tornjakServerInfo() {
    if (!this.props.globalTornjakServerInfo || Object.keys(this.props.globalTornjakServerInfo).length === 0) {
      return ""
    } else {
      return <TornjakServerInfoDisplay tornjakServerInfo={this.props.globalTornjakServerInfo} />
    }
  }

  render() {
    return (
      <div>
        <h3>Server Info</h3>
        {this.props.globalErrorMessage !== "OK" &&
          <div className="alert-primary" role="alert">
            <pre>
              {this.props.globalErrorMessage}
            </pre>
          </div>
        }
        <br /><br />
        {this.tornjakServerInfo()}
      </div>
    )
  }
}

const mapStateToProps = (state: RootState) => ({
  globalServerSelected: state.servers.globalServerSelected,
  globalServerInfo: state.servers.globalServerInfo,
  globalTornjakServerInfo: state.servers.globalTornjakServerInfo,
  globalErrorMessage: state.tornjak.globalErrorMessage,
})

export default connect(
  mapStateToProps,
  { serverSelectedFunc, tornjakServerInfoUpdateFunc, serverInfoUpdateFunc, tornjakMessageFunc }
)(TornjakServerInfo)
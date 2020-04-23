// Copyright 2017 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { Component } from 'react';
import { connect } from 'react-redux';

import * as PackageActions from '../../../modules/packages';
import PackageCard from '../packages/PackageCard';

interface Props {
  dispatch: (action: any) => any;
  match: any;
  packages: PackageActions.PackageSet;
}

interface State {
  verify_website: boolean;
  verify_license: boolean;
  verify_copyright: boolean;
  comments: string;
}

class PackageVerification extends Component<Props, State> {
  allChecked = false;

  state = {
    verify_website: false,
    verify_license: false,
    verify_copyright: false,
    comments: '',
  };

  changeEvent = (name: string) => {
    return (e: any) => {
      // read the value, unless it's a checkbox
      let val = e.currentTarget.value;
      if (e.currentTarget.checked !== undefined) {
        val = e.currentTarget.checked;
      }

      this.setState({ [name]: val } as State);
    };
  };

  renderVerifyOption = (name: string, text: string) => {
    const fullName = `verify_${name}`;
    return (
      <div className="checkbox">
        <label>
          <input
            type="checkbox"
            name={fullName}
            onChange={this.changeEvent(fullName)}
            checked={this.state[fullName]}
          />{' '}
          {text}
        </label>
      </div>
    );
  };

  submitForm = (e: any) => {
    const {
      dispatch,
      match: {
        params: { packageId },
      },
    } = this.props;
    e.preventDefault();
    dispatch(
      PackageActions.verifyPackage(
        packageId,
        this.allChecked,
        this.state.comments
      )
    );
  };

  validate = () => {
    this.allChecked = ['website', 'license', 'copyright']
      .map((x) => this.state[`verify_${x}`])
      .reduce((a, b) => a && b, true);

    return this.allChecked || this.state.comments.trim().length > 0;
  };

  render() {
    const {
      match: {
        params: { packageId },
      },
    } = this.props;

    const valid = this.validate();

    return (
      <div className="row">
        <div className="col-md-8">
          <PackageCard
            packageId={packageId}
            preStyle={{ overflow: 'auto', maxHeight: '400px' }}
          />
        </div>

        <div className="col-md-4">
          <form onSubmit={this.submitForm}>
            {this.renderVerifyOption('license', 'License name/text is correct')}
            {this.renderVerifyOption(
              'copyright',
              'Copyright statement is correct'
            )}
            {this.renderVerifyOption('website', 'Website is correct')}
            <div className="form-group">
              <label htmlFor="comments">Comments?</label>
              <textarea
                className="form-control"
                id="comments"
                name="comments"
                onChange={this.changeEvent('comments')}
                value={this.state.comments}
              />
            </div>
            <div className="btn-group float-right">
              <button
                className="btn btn-primary"
                type="submit"
                disabled={!valid}
              >
                Save
              </button>
            </div>
            {valid || (
              <div className="form-text text-muted">
                You must verify all items are valid, or provide comments
                explaining which are incorrect.
              </div>
            )}
          </form>
        </div>
      </div>
    );
  }
}

export default connect((state: any) => ({
  packages: state.packages.set,
}))(PackageVerification);

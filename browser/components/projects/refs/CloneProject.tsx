// Copyright 2018 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

import * as React from 'react';
import { connect } from 'react-redux';

import { Link } from 'react-router-dom';
import {
  AccessLevel,
  WebProject,
} from '../../../../server/api/v1/projects/interfaces';
import { cloneProject } from '../../../modules/projects';
import GroupSelect from '../acl/GroupSelect';
// import history from '../../../history';
// import * as ProjectActions from '../../../modules/projects';

interface Props {
  dispatch: (action: any) => any;
  project: WebProject;
  groups: string[];
}

interface State {
  newTitle: string;
  newVersion: string;
  newOwner?: string;
  keepPermissions: boolean;
}

class CloneProject extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);

    const project = props.project || {};

    this.state = {
      newTitle: `${project.title} (copy)` || '',
      newVersion: project.version || '',
      newOwner: undefined,
      keepPermissions: true,
    };
  }

  onTitleChange = (e) => {
    this.setState({ newTitle: e.target.value });
  };
  onVersionChange = (e) => {
    this.setState({ newVersion: e.target.value });
  };
  onKeepPermissionsChange = (e) => {
    this.setState({ keepPermissions: e.target.checked });
  };

  cloneSubmit = (e) => {
    const {
      dispatch,
      project,
      project: { projectId },
    } = this.props;
    const { newTitle, newVersion, newOwner, keepPermissions } = this.state;

    e.preventDefault();

    const newAcl = keepPermissions ? { ...project.acl } : {};
    newAcl[newOwner!] = 'owner' as AccessLevel;

    dispatch(
      cloneProject(projectId, {
        title: newTitle,
        version: newVersion,
        acl: newAcl,
      })
    );
  };

  formIsComplete = (): boolean => {
    const { newTitle, newVersion, newOwner } = this.state;
    return (
      newTitle.length > 0 && newVersion.length > 0 && newOwner != undefined
    );
  };

  render() {
    const { project } = this.props;
    const { newTitle, newVersion, keepPermissions } = this.state;

    return (
      <form onSubmit={this.cloneSubmit}>
        <h2>
          Clone {project.title} <small>{project.version}</small>
        </h2>

        <p>
          You are about to clone{' '}
          <strong>
            "{project.title}" (version "{project.version}
            ")
          </strong>{' '}
          into a new project. Your new project will be completely separate from
          the project you're cloning; it won't receive updates when the original
          has been updated.
        </p>
        {/* <p>
          If you want to instead combine multiple projects together into a
          single attribution document, consider linking the projects together.
          (LINK TODO)
        </p> */}
        <p>
          Pick a new title and version for your project, and then select a group
          that will own the project.
        </p>

        <div className="form-group row">
          <label htmlFor="title" className="col-md-3 col-form-label">
            New Title
          </label>
          <div className="col-md-7">
            <input
              type="text"
              id="title"
              className="form-control"
              required={true}
              value={newTitle}
              onChange={this.onTitleChange}
            />
          </div>
        </div>

        <div className="form-group row">
          <label htmlFor="version" className="col-md-3 col-form-label">
            New Version
          </label>
          <div className="col-md-7">
            <input
              type="text"
              id="version"
              className="form-control"
              required={true}
              value={newVersion}
              onChange={this.onVersionChange}
            />
          </div>
        </div>

        <div className="form-group row">
          <label htmlFor="ownerGroup" className="col-md-3 col-form-label">
            New Project Owner (group)
          </label>
          <div className="col-md-7" id="ownerGroup-container">
            <GroupSelect
              name="ownerGroup"
              groups={this.props.groups}
              value={this.state.newOwner!}
              onChange={(val: any) => this.setState({ newOwner: val })}
            />
          </div>
        </div>

        <div className="form-group row">
          <label className="col-md-7 offset-md-3">
            <input
              type="checkbox"
              id="keepAcl"
              checked={keepPermissions}
              onChange={this.onKeepPermissionsChange}
            />{' '}
            Keep current permissions too{' '}
            <Link to={`/projects/${project.projectId}/acl`} target="_blank">
              (view)
            </Link>
          </label>
        </div>

        <button
          type="submit"
          className="btn btn-primary"
          disabled={!this.formIsComplete()}
        >
          Clone
        </button>
      </form>
    );
  }
}

export default connect((state: any) => ({
  project: state.projects.active,
  groups: state.common.info.groups ? state.common.info.groups : [],
}))(CloneProject);

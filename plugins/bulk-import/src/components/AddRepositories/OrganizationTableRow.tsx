import * as React from 'react';

import { Link } from '@backstage/core-components';

import TableCell from '@mui/material/TableCell';
import TableRow from '@mui/material/TableRow';

import { OrganizationData } from '../../types';
import {
  getRepositoryStatusForOrg,
  getSelectedRepositories,
} from '../../utils/repository-utils';

export const OrganizationTableRow = ({
  onOrgRowSelected,
  data,
  selectedRepos,
}: {
  onOrgRowSelected: (org: OrganizationData) => void;
  data: OrganizationData;
  selectedRepos: number[];
}) => {
  return (
    <TableRow hover>
      <TableCell component="th" scope="row" padding="none">
        {data.name}
      </TableCell>
      <TableCell align="left">
        <Link to={data.url}>{data.url}</Link>
      </TableCell>
      <TableCell align="left">
        {getSelectedRepositories(onOrgRowSelected, data, selectedRepos)}
      </TableCell>
      <TableCell align="left">{getRepositoryStatusForOrg(data)}</TableCell>
    </TableRow>
  );
};

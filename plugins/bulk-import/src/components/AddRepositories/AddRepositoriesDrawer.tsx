import React, { useState } from 'react';

import { Link } from '@backstage/core-components';

import {
  Card,
  Container,
  Drawer,
  IconButton,
  Typography,
} from '@material-ui/core';
import CloseIcon from '@material-ui/icons/Close';

import { AddRepositoriesFormValues, OrganizationData } from '../../types';
import { AddRepositoriesTableToolbar } from './AddRepositoriesTableToolbar';
import { OrganizationRepositoriesTable } from './OrganizationRepositoriesTable';

type AddRepositoriesDrawerProps = {
  open: boolean;
  onClose: () => void;
  onSelect: (ids: number[]) => void;
  title: string;
  data: OrganizationData;
  selectedRepositoriesFormData: AddRepositoriesFormValues;
  checkedRepos: number[];
};

export const AddRepositoriesDrawer = ({
  open,
  onClose,
  onSelect,
  title,
  data,
  selectedRepositoriesFormData,
  checkedRepos,
}: AddRepositoriesDrawerProps) => {
  const [searchString, setSearchString] = useState<string>('');

  const [selectedReposID, setSelectedReposID] =
    useState<number[]>(checkedRepos);

  const handleSelectReposFromDrawer = (reposID: number[]) => {
    setSelectedReposID(reposID);
  };

  return (
    <Drawer anchor="right" open={open} onClose={onClose}>
      <Container style={{ padding: '20px' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div>
            <Typography variant="h5">{data?.name}</Typography>
            <Link to={data?.url}>{data?.url}</Link>
          </div>
          <div>
            <IconButton onClick={onClose} className={'align-right'}>
              <CloseIcon />
            </IconButton>
          </div>
        </div>
        <Card style={{ marginTop: '20px', marginBottom: '60px' }}>
          <AddRepositoriesTableToolbar
            title={title}
            setSearchString={setSearchString}
            selectedReposFromDrawer={selectedReposID}
            selectedRepositoriesFormData={selectedRepositoriesFormData}
            activeOrganization={data}
          />
          <OrganizationRepositoriesTable
            searchString={searchString}
            activeOrganization={data}
            closeDrawer={onClose}
            updateSelectedRepos={handleSelectReposFromDrawer}
            updateField={onSelect}
            selectedRepos={selectedReposID}
          />
        </Card>
      </Container>
    </Drawer>
  );
};

import * as React from 'react';
import { useEffect } from 'react';

import { makeStyles } from '@material-ui/core';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';
import { FormikErrors } from 'formik';

import {
  AddRepositoriesData,
  AddRepositoriesFormValues,
  Order,
  OrganizationData,
} from '../../types';
import {
  getComparator,
  getNewSelectedRepositories,
} from '../../utils/repository-utils';
import { AddRepositoriesDrawer } from './AddRepositoriesDrawer';
import { getDataForOrganizations, getDataForRepositories } from './mockData';
import { OrganizationTableRow } from './OrganizationTableRow';
import { RepositoriesColumnHeader } from './RepositoriesColumnHeader';
import { RepositoriesHeader } from './RepositoriesHeader';
import { RepositoryTableRow } from './RepositoryTableRow';

const useStyles = makeStyles(theme => ({
  root: {
    alignItems: 'start',
    padding: theme.spacing(3, 0, 2.5, 2.5),
  },
  empty: {
    padding: theme.spacing(2),
    display: 'flex',
    justifyContent: 'center',
  },
  title: {
    display: 'flex',
    gap: '20px',
    alignItems: 'center',
  },
  footer: {
    '&:nth-of-type(odd)': {
      backgroundColor: `${theme.palette.background.paper}`,
    },
  },
}));

export const RepositoriesTable = ({
  searchString,
  selectedRepositoriesFormData,
  page,
  setPage,
  setFieldValue,
  showOrganizations = false,
}: {
  searchString: string;
  selectedRepositoriesFormData: AddRepositoriesFormValues;
  page: number;
  setPage: (page: number) => void;
  setFieldValue: (
    field: string,
    value: any,
    shouldValidate?: boolean,
  ) => Promise<FormikErrors<AddRepositoriesFormValues>> | Promise<void>;
  showOrganizations?: boolean;
}) => {
  const classes = useStyles();
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<string>('name');
  const [selected, setSelected] = React.useState<number[]>([]);

  const [rowsPerPage, setRowsPerPage] = React.useState(5);
  const [tableData, setTableData] = React.useState<
    AddRepositoriesData[] | OrganizationData[]
  >([]);
  const [isOpen, setIsOpen] = React.useState<boolean>(false);
  const [activeOrganization, setActiveOrganization] =
    React.useState<OrganizationData | null>();

  const reposData: AddRepositoriesData[] = getDataForRepositories();
  const orgsData: OrganizationData[] = getDataForOrganizations();

  useEffect(() => {
    if (showOrganizations) {
      setTableData(orgsData);
    } else {
      setTableData(reposData);
    }

    return () => {
      setTableData([]);
    };
  }, [showOrganizations]);

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const newSelected = filteredData
        .map(n => {
          if (n.catalogInfoYaml.status !== 'Exists') {
            return n.id;
          }
          return -1;
        })
        .filter(d => d);
      setSelected(newSelected);
      if (selectedRepositoriesFormData.repositoryType === 'repository') {
        setFieldValue(
          'repositories',
          getNewSelectedRepositories(filteredData, newSelected),
        );
      } else {
        setFieldValue(
          'organizations',
          getNewSelectedRepositories(filteredData, newSelected),
        );
      }
      return;
    }
    if (selectedRepositoriesFormData.repositoryType === 'repository') {
      setFieldValue('repositories', []);
    } else {
      setFieldValue('organizations', []);
    }
    setSelected([]);
  };

  const handleClick = (_event: React.MouseEvent, id: number) => {
    const selectedIndex = selected.indexOf(id);
    let newSelected: number[] = [];

    if (selectedIndex === -1) {
      newSelected = newSelected.concat(selected, id);
    } else if (selectedIndex === 0) {
      newSelected = newSelected.concat(selected.slice(1));
    } else if (selectedIndex === selected.length - 1) {
      newSelected = newSelected.concat(selected.slice(0, -1));
    } else if (selectedIndex > 0) {
      newSelected = newSelected.concat(
        selected.slice(0, selectedIndex),
        selected.slice(selectedIndex + 1),
      );
    }

    const repositories = getNewSelectedRepositories(reposData, newSelected);
    setSelected(newSelected);
    if (selectedRepositoriesFormData.repositoryType === 'repository') {
      setFieldValue('repositories', repositories);
    } else {
      setFieldValue('organizations', repositories);
    }
  };

  const handleChangePage = (_event: unknown, newPage: number) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (
    event: React.ChangeEvent<HTMLInputElement>,
  ) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const isSelected = (id: number) => selected.indexOf(id) !== -1;

  // Avoid a layout jump when reaching the last page with empty rows.
  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - tableData.length) : 0;

  const filteredData = React.useMemo(() => {
    let repositories = tableData;

    if (searchString) {
      const f = searchString.toUpperCase();
      repositories = repositories.filter((addRepoData: AddRepositoriesData) => {
        const n = addRepoData.name?.toUpperCase();
        return n?.includes(f);
      });
    }
    repositories = repositories.sort(getComparator(order, orderBy));

    return repositories;
  }, [tableData, searchString, order, orderBy]);

  const visibleRows = React.useMemo(() => {
    return filteredData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [filteredData, page, rowsPerPage]);

  const handleOrgRowSelected = React.useCallback((org: OrganizationData) => {
    setActiveOrganization(org);
    setIsOpen(true);
  }, []);

  const handleClose = React.useCallback(() => {
    setIsOpen(false), setActiveOrganization(null);
  }, [setIsOpen]);

  const handleUpdatesFromDrawer = React.useCallback(
    (drawerSelected: number[]) => {
      if (drawerSelected) {
        setSelected(drawerSelected);
        setFieldValue(
          'repositories',
          getNewSelectedRepositories(reposData, drawerSelected),
        );
      }
    },
    [selectedRepositoriesFormData],
  );

  return (
    <>
      <TableContainer>
        <Table
          sx={{ minWidth: 750 }}
          aria-labelledby="repositories-table"
          size="medium"
        >
          <RepositoriesHeader
            numSelected={selected.length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={tableData.length}
            showOrganizations={showOrganizations}
          />
          {visibleRows?.length > 0 ? (
            <TableBody>
              {visibleRows.map(row => {
                const isItemSelected = isSelected(row.id);

                return showOrganizations ? (
                  <OrganizationTableRow
                    onOrgRowSelected={handleOrgRowSelected}
                    data={row as OrganizationData}
                    selectedRepos={selected}
                  />
                ) : (
                  <RepositoryTableRow
                    handleClick={handleClick}
                    isItemSelected={isItemSelected}
                    data={row}
                    selectedRepositoryStatus={row.catalogInfoYaml.status}
                  />
                );
              })}
              {emptyRows > 0 && (
                <TableRow
                  style={{
                    height: 55 * emptyRows,
                  }}
                >
                  <TableCell colSpan={6} />
                </TableRow>
              )}
            </TableBody>
          ) : (
            <tbody>
              <tr>
                <td colSpan={RepositoriesColumnHeader.length}>
                  <div
                    data-testid="no-repositories-found"
                    className={classes.empty}
                  >
                    No records found
                  </div>
                </td>
              </tr>
            </tbody>
          )}
        </Table>
      </TableContainer>
      <TablePagination
        rowsPerPageOptions={[
          { value: 5, label: '5 rows' },
          { value: 10, label: '10 rows' },
          { value: 15, label: '15 rows' },
        ]}
        component="div"
        count={tableData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={null}
      />
      {showOrganizations && (
        <AddRepositoriesDrawer
          title="Selected repositories"
          data={activeOrganization as OrganizationData}
          onSelect={handleUpdatesFromDrawer}
          open={isOpen}
          onClose={handleClose}
          selectedRepositoriesFormData={selectedRepositoriesFormData}
          checkedRepos={selected}
        />
      )}
    </>
  );
};

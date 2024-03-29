import * as React from 'react';
import { useEffect } from 'react';

import { Button, makeStyles } from '@material-ui/core';
import Table from '@mui/material/Table';
import TableBody from '@mui/material/TableBody';
import TableCell from '@mui/material/TableCell';
import TableContainer from '@mui/material/TableContainer';
import TablePagination from '@mui/material/TablePagination';
import TableRow from '@mui/material/TableRow';

import { AddRepositoriesData, Order, OrganizationData } from '../../types';
import { getComparator } from '../../utils/repository-utils';
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
  createButton: {
    marginRight: theme.spacing(1),
  },
  footer: {
    '&:nth-of-type(odd)': {
      backgroundColor: `${theme.palette.background.paper}`,
    },
  },
  sidePanelfooter: {
    display: 'flex',
    flexDirection: 'row',
    justifyContent: 'right',
    marginTop: theme.spacing(2),
    position: 'fixed',
    bottom: '20px',
    backgroundColor: theme.palette.background.default,
  },
}));

export const OrganizationRepositoriesTable = ({
  searchString,
  updateField,
  closeDrawer,
  updateSelectedRepos,
  selectedRepos,
  activeOrganization,
}: {
  searchString: string;
  updateField: (ids: number[]) => void;
  closeDrawer: () => void;
  updateSelectedRepos: (reposID: number[]) => void;
  selectedRepos: number[];
  activeOrganization: OrganizationData;
}) => {
  const classes = useStyles();
  const [order, setOrder] = React.useState<Order>('asc');
  const [orderBy, setOrderBy] = React.useState<string>('name');
  const [selected, setSelected] = React.useState<number[]>([]);
  const [page, setPage] = React.useState(0);
  const [rowsPerPage, setRowsPerPage] = React.useState(5);

  const reposData: AddRepositoriesData[] =
    activeOrganization?.repositories.map(repository => ({
      id: repository.id,
      name: repository.name,
      url: repository.repoURL,
      organization: repository.organization,
      selectedRepositories: 0,
      catalogInfoYaml: {
        status: repository.status,
        yaml: '',
      },
    })) || [];

  const handleRequestSort = (
    _event: React.MouseEvent<unknown>,
    property: string,
  ) => {
    const isAsc = orderBy === property && order === 'asc';
    setOrder(isAsc ? 'desc' : 'asc');
    setOrderBy(property);
  };

  // On click Select from drawer, it update form values with selected repos of active organization from drawer
  const handleSelecRepoFromDrawer = (selected: number[]) => {
    updateField(selected);
    closeDrawer();
  };

  // when load drawer, set selected rows with checked repos from its parent, the values come from form values
  useEffect(() => {
    setSelected(selectedRepos);
  }, [selectedRepos]);

  const handleSelectAllClick = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.checked) {
      const allReposFromOrg = filteredData
        .map(n => {
          if (n.catalogInfoYaml.status !== 'Exists') {
            return n.id;
          }
          return -1;
        })
        .filter(d => d);
      const newSelected = [...new Set([...selected, ...allReposFromOrg])];
      return setSelected(newSelected), updateSelectedRepos(newSelected);
    } else {
      setSelected([]);
      updateSelectedRepos([]);
    }
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
    // update selected repos id in this drawer
    setSelected(newSelected);

    // update checked repos of its parent so header selected repos count changes
    updateSelectedRepos(newSelected);
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

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - reposData.length) : 0;

  const filteredData = React.useMemo(() => {
    let filteredRows = reposData;

    if (searchString) {
      const f = searchString.toUpperCase();
      filteredRows = filteredRows.filter(
        (addRepoData: AddRepositoriesData | OrganizationData) => {
          const n = addRepoData.name?.toUpperCase();
          return n?.includes(f);
        },
      );
    }
    filteredRows = [...filteredRows].sort(getComparator(order, orderBy));

    return filteredRows;
  }, [reposData, searchString, order, orderBy]);

  const visibleRows = React.useMemo(() => {
    return filteredData.slice(
      page * rowsPerPage,
      page * rowsPerPage + rowsPerPage,
    );
  }, [filteredData, page, rowsPerPage]);

  const selectedForActiveDrawer = React.useMemo(() => {
    return selected
      .filter(id => id > -1)
      .filter(
        id => activeOrganization?.repositories.map(r => r.id).includes(id),
      );
  }, [selected, reposData]);

  return (
    <>
      <TableContainer>
        <Table
          sx={{ minWidth: 750 }}
          aria-labelledby="drawer-repositories-table"
          size="medium"
        >
          <RepositoriesHeader
            numSelected={selectedForActiveDrawer.length}
            order={order}
            orderBy={orderBy}
            onSelectAllClick={handleSelectAllClick}
            onRequestSort={handleRequestSort}
            rowCount={
              reposData.filter(r => r.catalogInfoYaml.status !== 'Exists')
                .length
            }
            showOrganizations={false}
            isRepoSelectDrawer
          />
          {visibleRows?.length > 0 ? (
            <TableBody>
              {visibleRows.map(row => {
                const isItemSelected = isSelected(row.id);
                return (
                  <RepositoryTableRow
                    key={row.id}
                    handleClick={handleClick}
                    isItemSelected={isItemSelected}
                    data={row}
                    selectedRepositoryStatus={row.catalogInfoYaml.status}
                    isDrawer
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
        count={reposData.length}
        rowsPerPage={rowsPerPage}
        page={page}
        onPageChange={handleChangePage}
        onRowsPerPageChange={handleChangeRowsPerPage}
        labelRowsPerPage={null}
      />
      <div className={classes.sidePanelfooter}>
        <span>
          <Button
            variant="contained"
            onClick={() => handleSelecRepoFromDrawer(selected)}
            className={classes.createButton}
            disabled={selected.length === 0}
            aria-labelledby="select-from-drawer"
          >
            Select
          </Button>
        </span>
        <span>
          <Button
            aria-labelledby="cancel-drawer-select"
            variant="outlined"
            onClick={closeDrawer}
          >
            Cancel
          </Button>
        </span>
      </div>
    </>
  );
};

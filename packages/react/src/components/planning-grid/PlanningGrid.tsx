import React, { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

import DataGrid, {
  Column, Selection, Sorting, HeaderFilter,
  RequiredRule, Paging, Pager, Editing, Scrolling, LoadPanel,
} from 'devextreme-react/data-grid';
import SelectBox from 'devextreme-react/select-box';

import { RowClickEvent } from 'devextreme/ui/data_grid';

import { ItemField } from '../item-field/ItemField';
import { editFieldRender, statusItemRender, priorityFieldRender, priorityItemRender } from '../../shared/itemFieldRenderMethods';

import { PRIORITY_ITEMS, STATUS_ITEMS } from '../../shared/constants';

import { Task, PlanningProps } from '../../types/task';
import { GridEdit } from '../../types/planning-grid';

import './PlanningGrid.scss';

let useNavigation = true;

const priorityCellRender = ({ text }) => {
  return <ItemField text={`| ${text}`} />;
};

const CellComponent = ({ data }: { data: { text: string }}) => <ItemField text={data.text} />;

const editStatusRender = ({ setValue, value }: GridEdit) => (
  <SelectBox
    className='edit-cell'
    defaultValue={value}
    items={STATUS_ITEMS}
    fieldRender={editFieldRender}
    itemRender={statusItemRender}
    onValueChange={(value) => setValue(value)}
  />
);
const editPriorityRender = ({ setValue, value }: GridEdit) => (
  <SelectBox
    className='edit-cell'
    defaultValue={value}
    items={PRIORITY_ITEMS}
    fieldRender={priorityFieldRender}
    itemRender={priorityItemRender}
    onValueChange={(value) => setValue(value)}
  />
);

export const PlanningGrid = React.forwardRef<DataGrid, PlanningProps>(({ dataSource }, ref) => {
  const [data, setData] = useState<Task[]>();

  const navigate = useNavigate();

  useEffect(() => {
    setData(dataSource.filter((d) => d.status && d.priority));
  }, [dataSource]);

  const onRowPrepared = useCallback(({ rowType, rowElement, data }) => {
    if (rowType !== 'header' && data.status === 'Completed') {
      rowElement.classList.add('completed');
    }
  }, []);

  const navigateToDetails = useCallback(({ rowType }: RowClickEvent) => {
    if (useNavigation && rowType !== 'detailAdaptive') {
      navigate('/planning-task-details');
    }
  }, []);

  const toogleUseNavigation = useCallback(() => {
    useNavigation = !useNavigation;
  }, []);

  return (
    <DataGrid
      className='planning-grid'
      ref={ref}
      dataSource={data}
      columnAutoWidth
      hoverStateEnabled
      height='100%'
      onEditingStart={toogleUseNavigation}
      onEditCanceled={toogleUseNavigation}
      onSaved={toogleUseNavigation}
      onRowPrepared={onRowPrepared}
      onRowClick={navigateToDetails}>
      <LoadPanel enabled={false} />
      <Scrolling mode='virtual' />
      <Paging defaultPageSize={15} />
      <Pager visible showPageSizeSelector />
      <Editing mode='row' allowUpdating />
      <Selection selectAllMode='allPages' showCheckBoxesMode='always' mode='multiple' />
      <HeaderFilter visible />
      <Sorting mode='multiple' />

      <Column dataField='text' caption='Subject' hidingPriority={7}>
        <RequiredRule />
      </Column>
      <Column dataField='company' caption='Company' hidingPriority={6}>
        <RequiredRule />
      </Column>
      <Column dataField='priority' caption='Priority' cellRender={priorityCellRender} editCellRender={editPriorityRender} hidingPriority={4}>
        <RequiredRule />
      </Column>
      <Column dataField='startDate' caption='Start Date' dataType='date' hidingPriority={2}>
        <RequiredRule />
      </Column>
      <Column dataField='dueDate' caption='Due Date' dataType='date' sortOrder='asc' hidingPriority={1}>
        <RequiredRule />
      </Column>
      <Column dataField='owner' caption='Owner' hidingPriority={5}>
        <RequiredRule />
      </Column>
      <Column dataField='status' caption='Status' minWidth={120} cellComponent={CellComponent} editCellRender={editStatusRender} hidingPriority={3}>
        <RequiredRule />
      </Column>
    </DataGrid>
  );
});

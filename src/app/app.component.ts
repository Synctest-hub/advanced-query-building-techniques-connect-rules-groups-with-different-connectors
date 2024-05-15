import { TemplateRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { closest } from '@syncfusion/ej2-base';
import { isNullOrUndefined } from '@syncfusion/ej2-base';
import { RadioButtonModule } from '@syncfusion/ej2-angular-buttons';
import { DropDownListModule } from '@syncfusion/ej2-angular-dropdowns';
import { ColumnsModel, QueryBuilderModule } from '@syncfusion/ej2-angular-querybuilder';
import { Component, ViewChild } from '@angular/core';
import { RuleModel } from '@syncfusion/ej2-querybuilder';
import { QueryBuilderComponent } from '@syncfusion/ej2-angular-querybuilder';
import { NumericTextBoxModule, TextBoxModule } from '@syncfusion/ej2-angular-inputs';

@Component({
  standalone: true,
  imports: [
    CommonModule,
    QueryBuilderModule,
    DropDownListModule,
    RadioButtonModule,
    TextBoxModule,
    NumericTextBoxModule,
    FormsModule
  ],
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.css'],
})
export class AppComponent {
  @ViewChild('querybuilder') qryBldrObj: QueryBuilderComponent | any;
  public content: string = '';
  public filter: ColumnsModel[] = [ 
    { field: 'EmployeeID', label: 'Employee ID', type: 'number'}, 
    { field: 'EmployeeName', label: 'Employee Name', type: 'string'}, 
    { field: 'Designation', label: 'Designation', type: 'string'} 
  ];
  @ViewChild('ruleTemplate') ruleTemplate: TemplateRef<any> | any;
  public fields: Object = { text: 'label', value: 'field' }; 
  public operatorFields: Object = { text: 'text', value: 'value' };
  public importRules: any = { 
    'condition': '', 
    'rules': [{ 
      'condition': 'or', 
      'rules': [
        { 'label': 'Employee ID', 'field': 'EmployeeID', 'type': 'number', 'operator': 'equal', 'value': 1001, 'condition': 'and' }, 
        { 'label': 'Employee Name', 'field': 'EmployeeName', 'type': 'string', 'operator': 'equal', 'value': 'Nancy', 'condition': 'or' }, 
        { 'label': 'Designation', 'field': 'Designation', 'type': 'string', 'operator': 'equal', 'value': 'Developer' }
      ]}, 
      { 
        'condition': '', 
        'rules': [
          { 'label': 'Employee ID', 'field': 'EmployeeID', 'type': 'number', 'operator': 'equal', 'value': 1002 }
        ] 
      }
    ] 
  };

  dataBound(e: any): void { 
    this.updateRuleTemplate(this.qryBldrObj.columns);
  }
  
  actionBegin(args: any): void {
    let target: HTMLElement; let childElems: Array<HTMLElement>; 
    let group: RuleModel
    if (args.requestType === 'header-template-initialize') {
      target = document.getElementById(args.groupID) as HTMLElement;
      if (target) {
        childElems = Array.prototype.slice.call(target.querySelector('.e-rule-list')!.children);
        if (childElems.length && childElems[childElems.length - 1]) {
            group = this.qryBldrObj.getGroup(childElems[childElems.length - 1] as HTMLElement);
            args.condition = group.condition as string;
        }
      }
    }
    if (args.requestType === 'template-initialize') { 
      args.columns = this.qryBldrObj.columns; 
      args.rule.operator = 'equal'; 
      const group: RuleModel = this.qryBldrObj.getGroup(args.ruleID.split("_")[1]);
      const grpId: string = args.ruleID.split("_")[0] + '_' + args.ruleID.split("_")[1]; 
      let condition: string = ''; 
      let ruleElem: HTMLElement = document.getElementById(args.ruleID) as HTMLElement;
      if (ruleElem && ruleElem.previousSibling) { 
        const rule: RuleModel = this.qryBldrObj.getRule(ruleElem.previousSibling as HTMLElement); 
        if (rule && rule.condition) { 
          condition = rule.condition; 
        } 
      }
      args.group = {condition: condition, not: group.not, groupID: grpId };
      if (isNullOrUndefined(args.rule.custom)) { 
        if (condition != '') { 
          args.rule.custom = { isRule : true }; 
        } else { 
          args.rule.custom = { isGroup: true }; 
        } 
      }
      if (args.rule.type === '') { 
        args.rule.type = 'string'; 
      }
    }
  }

  updateRuleTemplate(columns: ColumnsModel[]): void {
    for (let i: number = 0; i < columns.length; i++ ) {
      if (columns[i].columns) { 
        this.updateRuleTemplate(columns[i].columns as ColumnsModel[]);
      } else { 
        columns[i].ruleTemplate = this.ruleTemplate as any; 
      }
    }
  }

  fieldChange(e: any): void { 
    this.qryBldrObj.notifyChange(e.value, e.element, 'field'); 
  }

  operatorChange(e: any): void { 
    this.qryBldrObj.getRule(e.event.target).operator = e.value; 
  }

  valueChange(e: any): void { 
    if (e.isInteracted) { 
      this.qryBldrObj.notifyChange(e.value, e.event.target, 'value'); 
    } 
  }

  ruleConditionChange(args: any): void{ 
    let ruleModel: RuleModel = this.qryBldrObj.getRule(closest(args.event.target, ".e-rule-container").previousSibling as HTMLElement); 
    ruleModel.condition = args.value;
    this.ruleChanged();
  }

  addRule(args: any): void {
    let target: HTMLElement; 
    let ruleList: Array<HTMLElement>; 
    let ruleModel: RuleModel; let grpId: string;
    target = closest(args.target, '.e-group-container') as HTMLElement; ruleList = Array.prototype.slice.call(target.querySelector('.e-rule-list')?.children);
    ruleModel = this.qryBldrObj.getRule(ruleList[ruleList.length - 1]);
    ruleModel.condition = "and"; grpId = closest(args.target, '.e-group-container').id.split('_')[1];
    let rule: any = {label: ruleModel.label, field: ruleModel.field, operator: "equal", type: ruleModel.type, custom: { isGroup: false, isRule: true }};
    this.qryBldrObj.addRules([rule], grpId);
  }

  addGroup(): void {
    let target: HTMLElement; let ruleList: Array<HTMLElement>; 
    let ruleModel: RuleModel;
    target = document.getElementById(this.qryBldrObj.element.id + '_group0') as HTMLElement;
    ruleList = Array.prototype.slice.call(target.querySelector('.e-rule-list')?.children);
    ruleModel = this.qryBldrObj.getGroup(ruleList[ruleList.length - 1]);
    ruleModel.condition = "and"; let column: ColumnsModel = this.qryBldrObj.columns[0];
    let rule: any = { 
      label: column.label, field: column.field, 
      operator: "equal", 
      type: column.type, 
      custom: { isGroup: true, isRule: false } 
    };
    this.qryBldrObj.addGroups([{not: false, rules: [rule]}], 'group0');
  }

  removeRule(args: any): void { 
    let ruleElem: HTMLElement = closest(args.target.offsetParent, '.e-rule-container') as HTMLElement; 
    let idColl: string[] = ruleElem.id.split('_'); this.qryBldrObj.deleteRules([idColl[1] + '_' + idColl[2]]); 
  }

  removeGroup(args: any): void { 
    this.qryBldrObj.deleteGroup(closest(args.target.offsetParent, '.e-group-container')); 
  }

  grpConditionChange(args: any): void {
    let ruleModel: RuleModel = this.qryBldrObj.getGroup(closest(args.event.target, ".e-group-container").previousSibling as HTMLElement);
    ruleModel.condition = args.value;
    this.ruleChanged();
  }

  ruleChanged(): void {
    this.content = this.qryBldrObj.getSqlFromRules(this.qryBldrObj.rule);
  }
}

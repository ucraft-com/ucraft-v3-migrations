const path = require('path');
const fs = require('fs');
const { cloneDeep, isEqual } = require('lodash');
const glob = require('glob');

glob(path.resolve(__dirname, '**/*.json'), (err, result) => {
  result.forEach(file => {
    const content = fs.readFileSync(file);

    const layout = JSON.parse(content.toString());

    const newLayout = migrate(cloneDeep(layout));

    if (!isEqual(layout, newLayout)) {
      console.log('prev: ', layout);
      console.log('then: ', newLayout);

      fs.writeFileSync(file, JSON.stringify(newLayout, null, 2));
    }

  });
});

function migrate(layout) {
  const newLayout = [];

  if (!Array.isArray(layout)) {
    return layout;
  }

  layout.forEach(widget => {
    if (widget.type === 'checkoutSubmitButton' && Array.isArray(widget.children) && widget.children.length > 0) {
      widget = widget.children[0];
      widget.params.variantType = 'BUTTON_CHECKOUT';
      widget.params.key = 'btn';
    }

    if (widget.type === 'loginSubmitButton') {
      widget.type = 'button';
      widget.params.variantType = 'BUTTON_LOGIN';
      widget.params.key = 'btn';
    }

    if (widget.type === 'submitButton') {
      widget.type = 'button';
      widget.params.variantType = 'BUTTON_SUBMIT';
      widget.params.key = 'btn';
    }

    migrateShippingAndBillingDetailsWidgets(widget);

    if (Array.isArray(widget.children)) {
      widget.children = migrate(widget.children);
    }

    newLayout.push(widget);
  });

  return newLayout;
}

function migrateShippingAndBillingDetailsWidgets(widget) {
  if (widget.type === "shippingDetails" || widget.type === "billingDetails") {
    if (widget.children[0].type === "form") {
      // We need to remove the first child (which is fom) and replace children with form's children
      widget.children = widget.children[0].children;

      // we need to update settings to include form widget's settings as well
      const currentFormSettings = {
        template: "blank",
        emails: [],
        postSubmissionAction: "SHOW_MESSAGE_AND_HIDE",
        redirectPageId: "",
        numberOfSubmissions: 1000,
        isMultipleSubmissionLimitationEnabled: false,
        isNumberLimitationEnabled: false,
        isSubmissionDeadlineEnabled: false,
        timestamp: Date.now(),
      };

      widget.params.settings = {
        ...widget.params.settings,
        ...currentFormSettings,
      };

      // we need to update props to include form widget's props as well
      const currentFormProps = {
        limitReachMessage: "Form is no longer available.",
        deadlineReachMessage: "Form is no longer available.",
      };

      widget.params.props = {
        ...widget.params.props,
        ...currentFormProps,
      };

      // we need to update defualtUiElements to include form widget's defualtUiElements as well
      const FormFields = {
        formText: "formText",
        formEmail: "formEmail",
        formTextarea: "formTextarea",
        formNumber: "formNumber",
        formLink: "formLink",
        formPassword: "formPassword",
        formConfirmPassword: "formConfirmPassword",
        formAddress: "formAddress",
        formDateTime: "formDateTime",
        formDropdown: "formDropdown",
        formCheckbox: "formCheckbox",
        formRadio: "formRadio",
        formSignature: "formSignature",
        formPhoneNumber: "formPhoneNumber",
        formFile: "formFile",
      };

      const currentFormDefaultUiElements = {
        [FormFields.formCheckbox]: "",
        [FormFields.formRadio]: "",
        [FormFields.formDropdown]: "",
        [FormFields.formText]: "",
        [FormFields.formEmail]: "",
        [FormFields.formPassword]: "",
        [FormFields.formNumber]: "",
        [FormFields.formLink]: "",
        [FormFields.formTextarea]: "",
        [FormFields.formConfirmPassword]: "",
      };

      widget.params.defaultUiElements = {
        ...widget.params.defaultUiElements,
        ...currentFormDefaultUiElements,
      };
    }
  }
}

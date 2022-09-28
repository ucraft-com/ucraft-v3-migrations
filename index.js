const path = require('path');
const fs = require('fs');
const { cloneDeep, isEqual } = require('lodash');
const glob = require('glob');
const { uuidGenerator } = require('./utils');

const backendPublicFolder = (/--backendPublicFolder=([^\s]*)/.exec(
  process.argv.join(" ")
) || [])[1];

const uploadButtonFormItemConfig = [
  {
    type: "button",
    hash: "c7c97734-64e3-4073-985a-288cd03c9965",
    params: {
      show: true,
      variantsStyles: [
        {
          breakpointId: "3",
          cssState: "normal",
          styles: [
            {
              type: "color",
              value: "inherit",
            },
            {
              type: "background",
              value:
                '[{"type":"solid","value":"rgb(245, 245, 245)","opacity":1,"active":true}]',
            },
            {
              type: "border-color",
              value: "rgb(217, 217, 217)",
            },
            {
              type: "border-top-left-radius",
              value: "13px",
            },
            {
              type: "border-top-right-radius",
              value: "13px",
            },
            {
              type: "border-bottom-left-radius",
              value: "13px",
            },
            {
              type: "border-bottom-right-radius",
              value: "13px",
            },
          ],
        },
      ],
      settings: [],
      key: "btn",
      content: {
        exclude: ["link"],
      },
      isMicroElement: true,
    },
    children: [
      {
        type: "icon",
        hash: "77643aeb-b87f-40dc-a394-d24c9551eadb",
        params: {
          show: true,
          variantsStyles: [
            {
              breakpointId: "3",
              cssState: "normal",
              styles: [
                {
                  type: "margin-right",
                  value: "4px",
                },
              ],
            },
          ],
          settings: [],
          key: "icn",
          isMicroElement: true,
          showContentInParent: true,
          props: {
            iconKey: "UploadOutlined",
          },
        },
        children: [],
      },
      {
        type: "label",
        hash: "408c3ec7-585a-423d-8229-a5ae72f0fa1b",
        params: {
          show: true,
          variantsStyles: [],
          settings: [],
          key: "lbl",
          isMicroElement: true,
          showContentInParent: true,
          props: {
            text: "Upload",
          },
        },
        children: [],
      },
    ],
  },
];

glob(
  path.resolve(backendPublicFolder || __dirname, '**/*.json').replace(/\\/gmi, '/'),
  (_err, result) => {
    result.forEach((file) => {
      const content = fs.readFileSync(file);

      const layout = JSON.parse(content.toString());

      const newLayout = migrate(cloneDeep(layout));

      if (!isEqual(layout, newLayout)) {
        console.log('prev: ', layout);
        console.log('then: ', newLayout);

        fs.writeFileSync(file, JSON.stringify(newLayout, null, 2));
      }
    });
  }
);

function migrate(layout) {
  const newLayout = [];

  if (!Array.isArray(layout)) {
    return layout;
  }

  layout.forEach((widget) => {
    if (
      widget.type === 'checkoutSubmitButton' &&
      Array.isArray(widget.children) &&
      widget.children.length > 0
    ) {
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

    if (widget.type === 'formItem' && widget.children.length > 0) {
      const isUploadButton = widget.params.settings?.validations.find(
        (validation) => validation.type === 'acceptTypes'
      );

      if (isUploadButton) {
        widget.children = uploadButtonFormItemConfig;
      }
    }

    migrateShippingAndBillingDetailsWidgets(widget);
    migrateBurgerMenuToButton(widget);

    if (Array.isArray(widget.children)) {
      widget.children = migrate(widget.children);
    }

    newLayout.push(widget);
  });

  return newLayout;
}

function migrateBurgerMenuToButton(widget) {
  if (widget.type === 'icon' && widget.params?.labelKey === 'burgerMenu') {
    widget.type = 'button';
    widget.key = 'btn';
    widget.params.props = { contentType: 'iconOnly' };
    widget.children = [{
      type: 'icon',
      hash: uuidGenerator(),
      params: {
        key: 'icn',
        isMicroElement: true,
        showContentInParent: true,
        props: { iconKey: 'MenuOutlined' },
        labelKey: 'burgerMenuIcon',
        settings: [],
        variantsStyles: []
      }
    },
    {
      type: 'label',
      hash: uuidGenerator(),
      params: {
        key: 'lbl',
        isMicroElement: true,
        showContentInParent: true,
        settings: [],
        props: { text: 'Label' }
      }
    }]
  }
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

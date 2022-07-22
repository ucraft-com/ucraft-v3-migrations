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

    if (Array.isArray(widget.children)) {
      widget.children = migrate(widget.children);
    }

    newLayout.push(widget);
  });

  return newLayout;
}

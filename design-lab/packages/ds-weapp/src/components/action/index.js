Component({
  properties: {
    label: { type: String, value: '' },
    variant: { type: String, value: 'primary' },
    disabled: { type: Boolean, value: false },
  },
  methods: {
    onTap() {
      if (this.data.disabled) return;
      this.triggerEvent('tap');
    },
  },
});

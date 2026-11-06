const TAU = Math.PI * 2;

/**
 * 环形进度：小程序没有 SVG，用 canvas 2d 画。
 * 颜色由页面传入（来自生成的 tokens.ts），组件本身不认识任何品牌。
 */
Component({
  properties: {
    value: { type: Number, value: 0 },
    size: { type: Number, value: 96 },
    stroke: { type: Number, value: 6 },
    track: { type: String, value: '' },
    fill: { type: String, value: '' },
    ariaLabel: { type: String, value: '' },
  },
  observers: {
    'value, size, stroke, track, fill': function observe() {
      this.draw();
    },
  },
  lifetimes: {
    ready() {
      this.draw();
    },
  },
  methods: {
    draw() {
      const query = this.createSelectorQuery();
      query
        .select('#ring-canvas')
        .fields({ node: true, size: true })
        .exec((result) => {
          const info = result && result[0];
          if (!info || !info.node) return;

          const canvas = info.node;
          const dpr = (wx.getWindowInfo && wx.getWindowInfo().pixelRatio) || (wx.getSystemInfoSync().pixelRatio || 2);
          const size = this.data.size;

          canvas.width = size * dpr;
          canvas.height = size * dpr;

          const ctx = canvas.getContext('2d');
          ctx.scale(dpr, dpr);
          ctx.clearRect(0, 0, size, size);

          const center = size / 2;
          const radius = Math.max(0, center - this.data.stroke / 2);

          if (this.data.track) {
            ctx.beginPath();
            ctx.arc(center, center, radius, 0, TAU);
            ctx.strokeStyle = this.data.track;
            ctx.lineWidth = this.data.stroke;
            ctx.stroke();
          }

          if (this.data.fill) {
            const ratio = Math.min(1, Math.max(0, this.data.value));
            ctx.beginPath();
            ctx.arc(center, center, radius, -Math.PI / 2, -Math.PI / 2 + TAU * ratio);
            ctx.strokeStyle = this.data.fill;
            ctx.lineCap = 'round';
            ctx.lineWidth = this.data.stroke;
            ctx.stroke();
          }
        });
    },
  },
});

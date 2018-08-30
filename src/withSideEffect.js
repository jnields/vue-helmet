const CONTEXT_KEY = 'vue-helmet-context';
const isServer = typeof window === 'undefined';
const isProd = process.env.NODE_ENV === 'production';

const mapInstancesToProps = instances => instances.map((vm) => {
  const { data } = vm.$vnode;
  return data ? data.props : undefined;
});

export default (
  reducePropsToState,
  handleStateChangeOnClient,
  mapStateOnServer,
) => {
  if (!isProd) {
    if (typeof reducePropsToState !== 'function') {
      throw new Error('Expected reducePropsToState to be a function.');
    }
    if (typeof handleStateChangeOnClient !== 'function') {
      throw new Error('Expected handleStateChangeOnClient to be a function.');
    }
    if (typeof mapStateOnServer !== 'undefined' && typeof mapStateOnServer !== 'function') {
      throw new Error('Expected mapStateOnServer to either be undefined or a function.');
    }
  }
  return (Component, providerName) => {
    if (!isProd) {
      if (typeof Component !== 'object' || typeof Component.render !== 'function') {
        throw new Error('Expected Component to be a Vue Component.');
      }
    }

    const Provider = {
      name: providerName,
      inject: {
        parentProvider: {
          from: CONTEXT_KEY,
          default: null,
        },
      },
      props: {
        context: {
          type: Object,
          default: () => ({}),
        },
      },
      data() {
        return {
          instances: [],
          last: null,
        };
      },
      methods: {
        update() {
          let current;
          this.last = this.$nextTick().then(() => {
            if (this.last !== current) return;
            const nextState = reducePropsToState(mapInstancesToProps(this.instances));
            handleStateChangeOnClient(nextState);
            this.context.state = nextState;
          });
          current = this.last;
        },
      },
      created() {
        if (this.parentProvider) throw new Error('Nesting of side-efect Providers is not allowed');
        let nextState = reducePropsToState(mapInstancesToProps(this.instances));
        if (mapStateOnServer) nextState = mapStateOnServer(nextState);
        this.context.state = nextState;
      },
      provide() {
        return {
          [CONTEXT_KEY]: {
            instances: this.instances,
            staticContext: this.$props.context,
            provider: this,
          },
        };
      },
      render() {
        return this.$slots.default[0];
      },
    };

    const NullComponent = {
      render() {
        return this.$slots.default;
      },
    };

    const Consumer = {
      name: `${Component.name}-side-effect`,
      inject: [CONTEXT_KEY],
      props: Component.props,
      created() {
        const context = this[CONTEXT_KEY];
        if (!context) {
          throw new Error('cannot render a side-effect without a side-effect Provider');
        }
        const { instances, staticContext } = context;
        instances.push(this);
        if (!isServer) return;
        let nextState = reducePropsToState(mapInstancesToProps(instances));
        if (mapStateOnServer) nextState = mapStateOnServer(nextState);
        staticContext.state = nextState;
      },
      mounted() {
        this[CONTEXT_KEY].provider.update();
      },
      beforeUpdate() {
        this[CONTEXT_KEY].provider.update();
      },
      beforeDestroy() {
        const { instances, provider } = this[CONTEXT_KEY];
        instances.splice(instances.indexOf(this), 1);
        provider.$forceUpdate();
      },
      render(h) {
        return h(
          Component,
          {
            props: this.$props,
            attrs: this.$attrs,
            listeners: this.$on,
            scopedSlots: this.$scopedSlots,
          },
          Object.entries(this.$slots).map(([slot, vnode]) => ({
            slot,
            render: () => h(NullComponent, vnode),
          })),
        );
      },
    };

    return { Provider, Consumer };
  };
};

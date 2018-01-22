// @flow
import ExecutionEnvironment from 'exenv';
import { type VmType } from './types';

const defaultContextKey = 'context';

export class Context<PropsType, ClientState, ServerState> {
  reducePropsToState: (Array<PropsType>) => ClientState;
  handleStateChangeOnClient: (state: ClientState) => void;
  mapStateOnServer: ?(state: ClientState) => ServerState;
  mountedInstances: Set<VmType>;
  state: ?ClientState;

  static canUseDOM: bool = ExecutionEnvironment.canUseDOM;

  constructor(
    reducePropsToState: (Array<PropsType>) => ClientState,
    handleStateChangeOnClient: (state: ClientState) => void,
    mapStateOnServer?: (state: ClientState) => ServerState,
  ) {
    this.reducePropsToState = reducePropsToState;
    this.handleStateChangeOnClient = handleStateChangeOnClient;
    this.mapStateOnServer = mapStateOnServer;
    this.mountedInstances = new Set();
  }
  add(value: VmType): void {
    this.mountedInstances.add(value);
  }
  remove(value: VmType): void {
    this.mountedInstances.delete(value);
  }
  emitChange(canUseDOM: boolean): void {
    const mountedInstances = Array.from(this.mountedInstances);
    const propsList = mountedInstances.map((vm) => {
      const { data } = vm.$vnode;
      const props : any = data ? data.props : undefined;
      return (props: PropsType);
    });
    const state = this.reducePropsToState(propsList);
    if (canUseDOM) {
      this.handleStateChangeOnClient(state);
    }
    this.state = state;
  }
  peek(): ?ClientState {
    return this.state;
  }
  rewind(): ?ServerState {
    if (Context.canUseDOM) {
      throw new Error('You may only call rewind() on the server. Call peek() to read the current state.');
    }
    const recordedState = this.state;
    this.state = null;
    this.mountedInstances.clear();
    return this.mapStateOnServer && recordedState
      ? this.mapStateOnServer(recordedState)
      : null;
  }
}

export const ContextProvider = {
  name: 'side-effect-provider',
  props: {
    contextKey: {
      type: String,
      default: defaultContextKey,
    },
    context: {
      type: Context,
      required: true,
    },
  },
  provide() {
    return {
      [this.contextKey]: this.context,
    };
  },
  render() {
    const [result] = this.$slots.default;
    return result;
  },
};

export default function withSideEffect(
  WrappedComponent: { props?: mixed, name?: string },
  contextKey: string = defaultContextKey,
) {
  if (!WrappedComponent || typeof WrappedComponent.render !== 'function') {
    throw new Error('Expected WrappedComponent to be a Vue component.');
  }
  const SideEffect = {
    inject: [contextKey],
    name: `side-effect-${WrappedComponent.name || 'anonymous'}`,
    created() {
      const context = (this[contextKey]: Context<*, *, *>);
      // $FlowFixMe
      context.add(this);
      // $FlowFixMe
      context.emitChange(Context.canUseDOM);
    },
    updated() {
      const context = (this[contextKey]: Context<*, *, *>);
      // $FlowFixMe
      context.emitChange(Context.canUseDOM);
    },
    beforeDestroy() {
      const context = (this[contextKey]: Context<*, *, *>);
      // $FlowFixMe
      context.remove(this);
      // $FlowFixMe
      context.emitChange(Context.canUseDOM);
    },
    render(h: *) {
      return h(WrappedComponent, { props: this.$vnode.data.props }, this.$slots.default);
    },
  };
  return SideEffect;
}

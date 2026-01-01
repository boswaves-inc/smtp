import EventEmitter from 'events';
import pino, { Bindings, ChildLoggerOptions, Level, LevelChangeEventListener, LevelMapping, LogFn, Logger as Primitive } from 'pino'
import pretty from "pino-pretty";

const DEVELOPMENT = process.env.NODE_ENV !== 'production'

export class Logger implements Primitive {
    private _inner: Primitive;

    constructor({ level = 'info' }: { level: Level }) {
        const stream = pretty({
            colorize: true,
            ignore: "time,pid",
            translateTime: 'HH:MM:ss',

        });

        this._inner = pino({ level, }, DEVELOPMENT ? stream : undefined)

    }

    // Log methods
    fatal: LogFn = (...args: any[]) => (this._inner.fatal as any)(...args)
    error: LogFn = (...args: any[]) => (this._inner.error as any)(...args)
    warn: LogFn = (...args: any[]) => (this._inner.warn as any)(...args)
    info: LogFn = (...args: any[]) => (this._inner.info as any)(...args)
    debug: LogFn = (...args: any[]) => (this._inner.debug as any)(...args)
    trace: LogFn = (...args: any[]) => (this._inner.trace as any)(...args)
    silent: LogFn = (...args: any[]) => (this._inner.silent as any)(...args)

    // Properties
    get level() { return this._inner.level }
    set level(val) { this._inner.level = val }
    get msgPrefix() { return this._inner.msgPrefix }
    get version() { return this._inner.version }
    get levels(): LevelMapping { return this._inner.levels }
    get useLevelLabels() { return this._inner.useLevelLabels }
    get levelVal() { return this._inner.levelVal }
    get customLevels() { return this._inner.customLevels }
    get useOnlyCustomLevels() { return this._inner.useOnlyCustomLevels }
    // get onChild() { return this._inner.onChild }

    // Methods
    child = <T extends string = never>(bindings: Bindings, options?: ChildLoggerOptions<T>) => this._inner.child(bindings, options)
    onChild = (child: pino.Logger) => this._inner.onChild(child)
    isLevelEnabled = (level: string) => this._inner.isLevelEnabled(level)
    bindings = () => this._inner.bindings()
    setBindings = (bindings: Bindings) => this._inner.setBindings(bindings)
    flush = (cb?: (err?: Error) => void) => this._inner.flush(cb)

    // EventEmitter methods
    on = (event: 'level-change', listener: LevelChangeEventListener) => (this._inner.on(event, listener), this)
    off = (event: string | symbol, listener: (...args: unknown[]) => void) => (this._inner.off(event, listener), this)
    emit = <K>(event: string | symbol, ...args: any[]) => this._inner.emit<K>(event, ...args)
    once = (event: 'level-change', listener: LevelChangeEventListener) => (this._inner.once(event, listener), this)
    eventNames = () => this._inner.eventNames();
    listeners = <K>(event: string | symbol) => this._inner.listeners<K>(event)
    listenerCount = <K>(event: string | symbol, listener?: Function) => this._inner.listenerCount<K>(event, listener)
    rawListeners = <K>(event: string | symbol) => this._inner.rawListeners<K>(event)
    addListener = (event: 'level-change', listener: LevelChangeEventListener) => (this._inner.addListener(event, listener), this)
    prependListener = (event: 'level-change', listener: LevelChangeEventListener) => (this._inner.prependListener(event, listener), this)
    prependOnceListener = (event: 'level-change', listener: LevelChangeEventListener) => (this._inner.prependOnceListener(event, listener), this)
    removeListener = (event: 'level-change', listener: LevelChangeEventListener) => (this._inner.removeListener(event, listener), this)
    getMaxListeners = () => this._inner.getMaxListeners()
    removeAllListeners = (event?: string | symbol) => (this._inner.removeAllListeners(event), this)
    setMaxListeners = (n: number) => (this._inner.setMaxListeners(n), this);

    [EventEmitter.captureRejectionSymbol] = (error: Error, event: string | symbol, ...args: unknown[]) => this._inner[EventEmitter.captureRejectionSymbol]?.(error, event, ...args)
}

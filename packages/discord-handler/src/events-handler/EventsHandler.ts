import { uuidv4 } from '@dyn/utils';
import path from 'path';
import DcClientHandler from '../DcClientHandler';
import { logger } from '../logger';
import { TFile, flattenFileTree, getFilesTree } from '../utils/get-file-tree';
import Event, { TEventMeta } from './Event';

export default class EventsHandler {
  private readonly _instance: DcClientHandler;
  private readonly _config: TEventsHandlerConfig;

  private _events: Map<string, Event> = new Map();

  private static DEFAULT_EVENTS_DIR = path.join(__dirname, 'events');

  constructor(instance: DcClientHandler, config: TEventsHandlerConfig) {
    this._instance = instance;
    this._config = config;

    this.initializeEventsFromDirectory(
      this._config.eventsDir,
      this._config.fileSuffixes
    );
  }

  private async initializeEventsFromDirectory(
    eventsDir?: string,
    fileSuffixes: string[] = []
  ) {
    const eventFiles: TFile[] = [];
    if (eventsDir) {
      const eventsFileTree = await getFilesTree(eventsDir, {
        suffixes: fileSuffixes,
      });
      eventFiles.push(...flattenFileTree(eventsFileTree));
    }
    const defaultEventsFileTree = await getFilesTree(
      EventsHandler.DEFAULT_EVENTS_DIR
    );
    eventFiles.push(...flattenFileTree(defaultEventsFileTree));

    // Create Events
    for (const eventFile of eventFiles) {
      const meta = eventFile.content as TEventMeta;
      const event = this.createEvent(meta, eventFile.name);
      this._events.set(event.key, event);
    }

    // Register Events
    this.registerEvents(Array.from(this._events.values()));

    logger.info('Registered Events', {
      events: Array.from(this._events.values()).map((event) => event.key),
    });
  }

  public registerEvent(meta: TEventMeta) {
    const event = this.createEvent(meta);
    this.registerEvents([event]);
  }

  private createEvent(meta: TEventMeta, fileName?: string) {
    let key = meta?.key ?? fileName ?? uuidv4();
    if (this._events.has(key)) {
      const previousKey = key;
      key = `${key}_${uuidv4()}`;
      logger.warn(
        `The Event name '${previousKey}' has already been used! The Event has been renamed to '${key}'.`
      );
    }
    // @ts-ignore (Expression produces a union type that is too complex to represent.)
    return new Event(this._instance, key, meta);
  }

  private registerEvents(events: Event[]) {
    for (const event of events) {
      if (event.meta.once) {
        this._instance.client.once(event.meta.type, (...args) => {
          this.onEvent(event, args);
        });
      } else {
        this._instance.client.on(event.meta.type, (...args) => {
          this.onEvent(event, args);
        });
      }
    }
  }

  private async onEvent(event: Event, args: any[]) {
    if (
      event.meta.shouldExecuteCallback == null ||
      // @ts-ignore (Expression produces a union type that is too complex to represent.)
      event.meta.shouldExecuteCallback(...args)
    ) {
      // @ts-ignore (Expression produces a union type that is too complex to represent.)
      event.meta.callback(this._instance, ...args);
    }
  }
}

export type TEventsHandlerConfig = {
  eventsDir?: string;
  fileSuffixes?: string[];
};

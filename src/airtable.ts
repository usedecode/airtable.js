import Base from './base';
import Record from './record';
import Table from './table';
import fetch from './fetch';
import AirtableError from './airtable_error';
import {AirtableBase} from './airtable_base';
import type {ObjectMap} from './object_map';

type CustomHeaders = ObjectMap<string, string | number | boolean>;

class Airtable {
    readonly _apiKey: string;
    readonly _apiVersion: string;
    readonly _apiVersionMajor: string;
    readonly _customHeaders: CustomHeaders;
    readonly _endpointUrl: string;
    readonly _noRetryIfRateLimited: boolean;
    readonly _fetch: typeof fetch;

    requestTimeout: number;

    static Base = Base;
    static Record = Record;
    static Table = Table;
    static Error = AirtableError;

    static apiKey: string;
    static apiVersion: string;
    static endpointUrl: string;
    static noRetryIfRateLimited: boolean;

    constructor(
        opts: {
            apiKey?: string;
            apiVersion?: string;
            customHeaders?: CustomHeaders;
            endpointUrl?: string;
            noRetryIfRateLimited?: boolean;
            requestTimeout?: number;
            fetch?: typeof fetch;
        } = {}
    ) {
        const defaultConfig = Airtable.default_config();

        const apiVersion = opts.apiVersion || Airtable.apiVersion || defaultConfig.apiVersion;

        Object.defineProperties(this, {
            _apiKey: {
                value: opts.apiKey || Airtable.apiKey || defaultConfig.apiKey,
            },
            _apiVersion: {
                value: apiVersion,
            },
            _apiVersionMajor: {
                value: apiVersion.split('.')[0],
            },
            _customHeaders: {
                value: opts.customHeaders || {},
            },
            _endpointUrl: {
                value: opts.endpointUrl || Airtable.endpointUrl || defaultConfig.endpointUrl,
            },
            _noRetryIfRateLimited: {
                value:
                    opts.noRetryIfRateLimited ||
                    Airtable.noRetryIfRateLimited ||
                    defaultConfig.noRetryIfRateLimited,
            },
            _fetch: {
                value: opts.fetch || fetch
            }
        });

        this.requestTimeout = opts.requestTimeout || defaultConfig.requestTimeout;

        if (!this._apiKey) {
            throw new Error('An API key is required to connect to Airtable');
        }
    }

    base(baseId: string): AirtableBase {
        return Base.createFunctor(this, baseId);
    }

    static default_config(): ({
        endpointUrl: string,
        apiVersion: string,
        apiKey: string,
        noRetryIfRateLimited: boolean,
        requestTimeout: number,
    }) {
        return {
            endpointUrl: process.env.AIRTABLE_ENDPOINT_URL || 'https://api.airtable.com',
            apiVersion: '0.1.0',
            apiKey: process.env.AIRTABLE_API_KEY,
            noRetryIfRateLimited: false,
            requestTimeout: 300 * 1000, // 5 minutes
        };
    }

    static configure({apiKey, endpointUrl, apiVersion, noRetryIfRateLimited}: {
        apiKey: string,
        endpointUrl: string,
        apiVersion: string,
        noRetryIfRateLimited: boolean,
    }): void {
        Airtable.apiKey = apiKey;
        Airtable.endpointUrl = endpointUrl;
        Airtable.apiVersion = apiVersion;
        Airtable.noRetryIfRateLimited = noRetryIfRateLimited;
    }

    static base(baseId: string): AirtableBase {
        return new Airtable().base(baseId);
    }
}

export = Airtable;

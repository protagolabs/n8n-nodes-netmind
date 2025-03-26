
/* eslint-disable n8n-nodes-base/node-dirname-against-convention */
import { OpenAIEmbeddings } from '@langchain/openai';
import {
	NodeConnectionType,
	type INodeType,
	type INodeTypeDescription,
	type ISupplyDataFunctions,
	type SupplyData,
} from 'n8n-workflow';
import type { ClientOptions } from 'openai';
import { logWrapper } from '@n8n/n8n-nodes-langchain/dist/utils/logWrapper';
import { getConnectionHintNoticeField } from '@n8n/n8n-nodes-langchain/dist/utils/sharedFields';




export class EmbeddingsNetmind implements INodeType {

	description: INodeTypeDescription = {
		displayName: 'Embeddings Netmind',
		name: 'embeddingsNetmind',
		icon: 'file:netmind.svg',
		credentials: [
			{
				name: 'netmindApi',
				required: true,
			},
		],
		group: ['transform'],
		version: 1,
		description: 'Use Embeddings Netmind',
		defaults: {
			name: 'Embeddings Netmind OpenAI',
		},

		codex: {
			categories: ['AI'],
			subcategories: {
				AI: ['Embeddings'],
			},
			resources: {
				primaryDocumentation: [
					{
						url: 'https://netmind.ai/',
					},
				],
			},
		},
		// eslint-disable-next-line n8n-nodes-base/node-class-description-inputs-wrong-regular-node
		inputs: [],
		// eslint-disable-next-line n8n-nodes-base/node-class-description-outputs-wrong
		outputs: [NodeConnectionType.AiEmbedding],
		outputNames: ['Embeddings'],
		properties: [
			getConnectionHintNoticeField([NodeConnectionType.AiVectorStore]),
			{
				displayName: 'Model',
				name: 'model',
				type: 'options',
				description: 'The name of the model to use',
				default: 'BAAI/bge-m3',
				options: [
					{
						name: 'BAAI Bge M3',
						value: 'BAAI/bge-m3',
					},
					{
						name: 'Nvidia NV Embed V2',
						value: 'nvidia/NV-Embed-v2',
					},
				],
			},
			{
				displayName: 'Options',
				name: 'options',
				placeholder: 'Add Option',
				description: 'Additional options to add',
				type: 'collection',
				default: {},
				options: [
					{
						displayName: 'Timeout',
						name: 'timeout',
						default: -1,
						description:
							'Maximum amount of time a request is allowed to take in seconds. Set to -1 for no timeout.',
						type: 'number',
					},

				],
			},
		],
	};

	async supplyData(this: ISupplyDataFunctions, itemIndex: number): Promise<SupplyData> {
		this.logger.debug('Supply data for embeddings');
		const credentials = await this.getCredentials<{ apiKey: string; }>('netmindApi');
		const modelName = this.getNodeParameter('model', itemIndex) as string;

		const options = this.getNodeParameter('options', itemIndex, {}) as {
			timeout?: number;
		};

		if (options.timeout === -1) {
			options.timeout = undefined;
		}

		const configuration: ClientOptions = {};
		configuration.baseURL = 'https://api.netmind.ai/inference-api/openai/v1';
		const embeddings = new OpenAIEmbeddings(
			{
				model: modelName,
				apiKey: credentials.apiKey,
				...options,
			},
			configuration,
		);

		return {
			response: logWrapper(embeddings, this),
		};
	}
}

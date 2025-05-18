import { IExecuteFunctions } from 'n8n-workflow';
import { handleClassificationOperations } from './classificationHandler';
import { Operation } from '../utils/constants';

jest.mock('n8n-workflow');

describe('ClassificationHandler', () => {
    let mockExecuteFunctions: jest.Mocked<IExecuteFunctions>;
    const mockCredentials = {
        serverUrl: 'https://test-server.com',
        username: 'testuser',
        password: 'testpass'
    };

    beforeEach(() => {
        mockExecuteFunctions = {
            getNode: jest.fn().mockReturnValue({ name: 'Test Node' }),
            helpers: {
                httpRequest: jest.fn()
            }
        } as any;
    });

    describe('handleGetClassifyAttributes', () => {
        it('should successfully fetch classification attributes', async () => {
            const mockResponse = {
                attributes: ['attr1', 'attr2']
            };

            mockExecuteFunctions.helpers.httpRequest.mockResolvedValueOnce(mockResponse);

            const result = await handleClassificationOperations.call(
                mockExecuteFunctions,
                [],
                Operation.GetClassifyAttributes,
                mockCredentials
            );

            expect(result[0].json.success).toBe(true);
            expect(result[0].json.data).toEqual(mockResponse);
            expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalledWith({
                url: 'https://test-server.com/api/classifyAttributes',
                method: 'GET',
                headers: {
                    'Accept': 'application/json'
                },
                json: true,
                auth: {
                    username: 'testuser',
                    password: 'testpass'
                }
            });
        });

        it('should handle errors appropriately', async () => {
            const errorMessage = 'API Error';
            mockExecuteFunctions.helpers.httpRequest.mockRejectedValueOnce(new Error(errorMessage));

            await expect(
                handleClassificationOperations.call(
                    mockExecuteFunctions,
                    [],
                    Operation.GetClassifyAttributes,
                    mockCredentials
                )
            ).rejects.toThrow();

            expect(mockExecuteFunctions.helpers.httpRequest).toHaveBeenCalled();
        });
    });
}); 
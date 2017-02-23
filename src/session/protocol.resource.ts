import { ResourceParams } from 'ng2-resource-rest';

import { RestResource } from '../rest/rest.resource.ts';

@ResourceParams({
    path: '/registration-protocol/{id}'
})

/**
 * The protocol REST resource.
 *
 * @module session
 * @class ProtocolResource
 * @extends RestResource
 */
export class ProtocolResource extends RestResource { }

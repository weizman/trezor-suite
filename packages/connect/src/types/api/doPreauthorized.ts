import type { PROTO } from '../../constants';
import type { Params, Response } from '../params';

export declare function doPreauthorized(
    params: Params<PROTO.DoPreauthorized>,
): Response<PROTO.PreauthorizedRequest>;

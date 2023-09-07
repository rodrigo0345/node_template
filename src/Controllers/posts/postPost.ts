import { AVAILABLE_DATABASE_SERVICES } from '../..';
import {
    Request,
    Response,
} from 'express';
import {
    ApiError,
    ApiSuccess,
    ApiResponse,
} from '../../Common/ApiResponse';
import { ResultSetHeader } from 'mysql2';
import dev_log from '../../Common/DevLog';
import Post from '../../Types/post';
import Cache from '../../Types/cache';

export default async function postPost(
    req: Request,
    res: Response,
) {
    const { title, content } = req.body;

    let author = 'dunno@nomail.com';

    if (req.user) {
        author = (req.user as any)
            .email;
    }

    if (
        !AVAILABLE_DATABASE_SERVICES.main
    ) {
        return res
            .status(500)
            .json(
                ApiError(
                    'Database service not available',
                ),
            );
    }

    try {
        Post.type.parse({
            title,
            content,
            author,
        });
    } catch (err: any) {
        return res
            .status(400)
            .json(
                ApiError(err.message),
            );
    }
    const postTable = new Post(
        AVAILABLE_DATABASE_SERVICES.main,
    );

    const result =
        await postTable.insertOne({
            title,
            content,
            author,
        });

    dev_log({ result });

    if (result.status === 'error') {
        return res
            .status(500)
            .json(result);
    }

    // clean cache
    let cache: Cache | null = null;
    if (
        AVAILABLE_DATABASE_SERVICES.cache
    ) {
        cache = new Cache(
            AVAILABLE_DATABASE_SERVICES.cache,
        );
    }

    cache
        ? await cache.delete('g_posts')
        : void 0;

    return res.json(
        ApiSuccess<number>(result.data),
    );
}

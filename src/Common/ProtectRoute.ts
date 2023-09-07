import { ApiError } from './ApiResponse';
import dev_log from './DevLog';

export default function protectRoute(
    req: any,
    res: any,
    next: any,
) {
    dev_log({ user: req.user });

    if (req.isAuthenticated()) {
        return next();
    }
    return res
        .status(401)
        .json(ApiError('Unauthorized'));
}

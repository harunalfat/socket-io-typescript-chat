import {User} from './user';
import {Action} from './action';

export interface Message {
    from?: User;
    channel?: string;
    content?: any;
    action?: Action;
}

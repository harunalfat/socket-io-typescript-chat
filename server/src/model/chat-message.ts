import { Message, User } from './';

export class ChatMessage extends Message{
    constructor(from: User, content: string, channel: string) {
        super(from, content, channel);
    }
}
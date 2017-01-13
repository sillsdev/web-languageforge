import { User } from '../models/user';

export const USER = [
    new User(0, 'admin@example.com', 'pass', 'admin', 'admin', 'admin'),
    new User(1, 'editor@example.com', 'pass', 'Editor', 'Last', 'editor'),
    new User(1, 'reviewer@example.com', 'pass', 'Reviewer', 'Last', 'reviewer')
];
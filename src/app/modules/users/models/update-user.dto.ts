export class UpdateUserDTO {
    public constructor(
        public readonly name: string,
        public readonly email: string,
        public readonly roles: string,
    ) {}
}

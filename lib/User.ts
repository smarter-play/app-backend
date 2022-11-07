class User {
    id: string;
    name: string;
    surname: string;
    email: string;
    password?: string;
    

    constructor(id: string, name: string, surname: string, email: string, password?: string) {
        this.id = id;
        this.name = name;
        this.surname = surname;
        this.email = email;
        this.password = password;
    }

    async create(): Promise<void> {

    }

    async update(): Promise<void> {

    }


}

export default User;
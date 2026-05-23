export class CreateUserDto {
    login!: string;     
    password!: string;  
    firstName!: string;   
    lastName!: string;    
    middleName?: string;  
    managerId?: number; 
}

class UserController {

    constructor(formId,formIdUpdate,tableId){

        this.formUpdateEl = document.getElementById(formIdUpdate);
        this.formEl = document.getElementById(formId);
        this.tableEl = document.getElementById(tableId);

        this.onSubmit();
        this.onEdit();
        this.selectAll();

    }

    preview(formEl){

        let fieldPhoto = formEl.photo;

        fieldPhoto.addEventListener('change', event => {

            this.getPhoto(formEl).then(
                (content) => {

                    let photo = content;
                    formEl.querySelector('.photo').src = photo;

            });

        }); 

    }

    onSubmit(){

        this.preview(this.formEl);

        this.formEl.addEventListener('submit', event => {

            event.preventDefault();

            let btn = this.formEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formEl);

            // em caso de retirar required o erro da foto some
            if(!values){
                return false;
            }

            this.getPhoto(this.formEl).then(
            (content) => {

                values.photo = content;

                values.save().then(user => {

                    this.addLine(values);

                    this.formEl.reset();    

                    btn.disabled = false;

                });


            },
            (e) => {
                console.error(e);
            }
            );


        });

    }

    getPhoto(formEl){

        return new Promise((resolve,reject) => {

            let fileReader = new FileReader();

            let elements = [...formEl.elements].filter(item => {
    
                if(item.name === 'photo'){ 
    
                    return item;
    
                } 
    
            });    

        let file = elements[0].files[0];

        fileReader.onload = () => {

            resolve(fileReader.result);

        }

            
        fileReader.onerror = () => {
            reject(e);
        }

        if(file) {
            fileReader.readAsDataURL(file);
        } else {
            resolve('dist/img/boxed-bg.jpg');
        }

        });
    }


    eventEdit(tr){

        tr.querySelector('.btn-edit').addEventListener('click', (e) => {

            let json = JSON.parse(tr.dataset.user);

            this.formUpdateEl.dataset.trIndex = tr.sectionRowIndex;

            for (let name in json){

                let field = this.formUpdateEl.querySelector('[name=' + name.replace('_','')+']');

                if(field){
                    
                    switch(field.type){
                        case 'file':
                            continue;
                        break;
                        case 'radio':
                            field = this.formUpdateEl.querySelector('[name=' + name.replace('_','') + '][value=' + json[name] + ']');
                            field.checked;
                        break;
                        case 'checkbox':
                            field.checked = json[name];
                        break;

                    }

                    field.value = json[name];
                }

            }
            this.formUpdateEl.querySelector('.photo').src = json._photo;

            this.showPanelEdit();

        });

        tr.querySelector('.btn-delete').addEventListener('click', (e) => {
            if(confirm('Deseja realmente excluir? (Seus dados serão perdidos!)')){
                let user = new User();
                user.loadFromJSON(JSON.parse(tr.dataset.user));
                user.delete();
                // remove linha
                tr.remove();
                this.updateCount();
            }
        });

    }



    selectAll(){
 
        HttpRequest.get('/users').then(data => {
            data.users.forEach(dataUser => {
 
                let user = new User();
    
                user.loadFromJSON(dataUser);
    
                this.addLine(user);
    
            });
        })
                
    }



    getTr(dataUser, tr = null){

        if(tr === null) { tr = document.createElement('tr'); }

        tr.dataset.user = JSON.stringify(dataUser);

        tr.innerHTML = `
        <td><img src="${dataUser.photo}" alt="User Image" class="img-circle img-sm"></td>
        <td>${dataUser.name}</td>
        <td>${dataUser.email}</td>
        <td>${(dataUser.admin) ? 'Sim' : 'Não'}</td>
        <td>${Utils.dateFormat(dataUser.register)}</td>
        <td>
            <button type="button" class="btn btn-primary btn-xs btn-edit btn-flat">Editar</button>
            <button type="button" class="btn btn-danger btn-xs btn-delete btn-flat">Excluir</button>
        </td>`;
        
        return tr;

    }


    addLine(dataUser, tableEl){

        let tr = this.getTr(dataUser);
        
        this.eventEdit(tr);

        this.tableEl.appendChild(tr);
        
        this.updateCount();

        this.formEl.querySelector('.photo').src = 'dist/img/boxed-bg.jpg';

    }

    showPanelCreate(){

        document.querySelector('#box-user-create').style.display = 'block';
        document.querySelector('#box-user-update').style.display = 'none';

    }

    showPanelEdit(){

        document.querySelector('#box-user-create').style.display = 'none';
        document.querySelector('#box-user-update').style.display = 'block';

    }

    // EDITAR USUARIO
    onEdit(){

        this.preview(this.formUpdateEl);

        document.querySelector('.btn-cancel').addEventListener('click', e =>{

            this.showPanelCreate();

        });

        this.formUpdateEl.addEventListener('submit', event => {

            event.preventDefault();

            let btn = this.formUpdateEl.querySelector("[type=submit]");

            btn.disabled = true;

            let values = this.getValues(this.formUpdateEl);

            let index = this.formUpdateEl.dataset.trIndex;
            
            let tr = this.tableEl.rows[index];

            let userOld = JSON.parse(tr.dataset.user);

            let result = Object.assign({},userOld, values);

            this.getPhoto(this.formUpdateEl).then(
                (content) => {

                    if(!values.photo) {
                        result._photo = userOld._photo;
                    } else {
                        result._photo = content;
                    }

                    let user = new User();
                    user.loadFromJSON(result);

                    user.save().then(user => {

                        this.getTr(user, tr);

                        this.updateCount();
                        this.formUpdateEl.reset();
            
                        this.showPanelCreate();
            
                        btn.disabled = false;

                    });

                },
                (e) => {
                    console.error(e);
                }
                );


        });
        

    }

    updateCount(){

        let nbUsers = 0;
        let nbAdmin = 0;

        // converte HTML Collection em Array para o Foreach
        [...this.tableEl.children].forEach( tr => {

            nbUsers++;
            let user = JSON.parse(tr.dataset.user);
            if(user._admin) nbAdmin++;

        });

        document.querySelector('#nbUsers').innerHTML = nbUsers;
        document.querySelector('#nbAdmin').innerHTML = nbAdmin;

    }

    getValues(formEl){

        let user = {};
        let isValid = true;

        [...formEl.elements].forEach( (field, index) => {

            if(['name','email','password'].indexOf(field.name) > -1 && !field.value){

                field.parentElement.classList.add('has-error');
                isValid = false;

            }


            if(field.name == 'gender'){
                if(field.checked) {
                    user[field.name] = field.value;
                }
            } else if (field.name == 'admin') {
                user[field.name] = field.checked;
            } else {
                user[field.name] = field.value;
            }
        });
        
        if(!isValid) {
            return false;
        }

        return new User(
            user.name,
            user.gender,
            user.birth,
            user.country,
            user.email,
            user.password,
            user.photo,
            user.admin
        );
        
    }

}
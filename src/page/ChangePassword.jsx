import React from 'react'
import { Link } from 'react-router-dom'
import {MoveLeft} from 'lucide-react'
import OrderHeader from '../components/OrderHeader'
function ChangePassword() {
	return(
		<div className='profileOrder_content'>
			<OrderHeader/>
			<div className='profileOrder_header'>
				<div className='basket_back'>					
					<div className="examination_backspace">
						<Link to="/add-products-to-cart">
						<MoveLeft stroke="#232323" /> Назад
						</Link>
					</div>
					<h1>Смена пароля</h1>
				</div>
				<form className='form_profile' action="#">
					<div className='bg_form'>
						<label htmlFor="old_password">Старый Пароль</label>
					<input type="password" name="old_password" id="old_password"/>
					</div>
					<div className='bg_form'>
						<label htmlFor="new_password">Новый пароль</label>
					<input type="password" name="new_password" id="new_password"/>
					</div>
					<div className='bg_form'>
						<label htmlFor="confirm_new_password">Подтвердите новый пароль</label>
					<input type="password" name="confirm_new_password" id="confirm_new_password"/>
					</div>
					<div className='bg_form bg_form_down border_button'>					
					<button>Сохранить изменения</button>
					</div>
				</form>
			</div>
		</div>
	)
}
export default ChangePassword;
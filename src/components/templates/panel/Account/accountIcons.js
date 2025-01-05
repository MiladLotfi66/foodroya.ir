// accountIcons.js
import { 
  FaPiggyBank, 
  FaUser, 
  FaUsers, 
  FaUniversity, 
  FaBox, 
  FaTags, 
  FaUserTie, 
  FaBuilding, 
  FaWarehouse, 
  FaMoneyCheckAlt, 
  FaQuestionCircle 
} from 'react-icons/fa';

const accountIcons = {
  صندوق: FaPiggyBank,
  'حساب عادی': FaUser,
  'گروه حساب': FaUsers,
  'حساب بانکی': FaUniversity,
  کالا: FaBox,
  'دسته بندی کالا': FaTags,
  'اشخاص حقیقی': FaUserTie,
  'اشخاص حقوقی': FaBuilding,
  انبار: FaWarehouse,
  'حساب انتظامی': FaMoneyCheckAlt,
};

const DefaultIcon = FaQuestionCircle;

export { accountIcons, DefaultIcon };

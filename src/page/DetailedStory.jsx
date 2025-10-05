import React, { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { MoveLeft, CircleCheck, Clock3, Package, Truck } from 'lucide-react';
import OrderHeader from '../components/OrderHeader';
import { useAuth } from '../context/AuthContext';
import * as XLSX from 'xlsx';
import { saveAs } from 'file-saver';
import {
  Document,
  Page,
  Text,
  View,
  Font,
  StyleSheet,
  pdf,
} from '@react-pdf/renderer';

Font.register({
  family: 'Roboto',
  src: '/fonts/ofont.ru_Roboto.ttf',
});
const stylesPDF = StyleSheet.create({
  page: {
    fontFamily: 'Roboto',
    fontSize: 11,
    padding: 30,
    lineHeight: 1.5,
  },
  title: {
    fontSize: 18,
    marginBottom: 15,
    textAlign: 'center',
    fontWeight: 'bold',
  },
  infoBlock: {
    marginBottom: 20,
  },
  tableTitle: {
    marginBottom: 10,
    fontSize: 14,
    fontWeight: 'bold',
  },
  tableHeader: {
    flexDirection: 'row',
    borderBottom: '1 solid #000',
    paddingBottom: 5,
    marginBottom: 5,
  },
  tableRow: {
    flexDirection: 'row',
    borderBottom: '0.5 solid #ccc',
    paddingVertical: 3,
  },
  cell: {
    flex: 1,
    paddingRight: 5,
  },
  bold: {
    fontWeight: 'bold',
  },
  totalBlock: {
    marginTop: 15,
    borderTop: '1 solid #000',
    paddingTop: 8,
  },
  totalText: {
    fontSize: 13,
    textAlign: 'right',
  },
});


const STATUS_ORDER = ['issued', 'pending', 'assembled', 'delivered', 'completed'];
const STATUS_COLOR_MAP = {
  issued: 'color-green',
  pending: 'color-yellow',
  assembled: 'color-orange',
  delivered: 'color-blue',
  completed: 'color-bright-green',
};

const STATUS_MAP = {
  pending: 'pending',
  assembled: 'assembled',
  in_transit: 'delivered',
  completed: 'completed',
  delivered: 'delivered',
  issued: 'issued',
};
function OrderPDFDocument({ order }) {
  const total = order.items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  return (
    <Document>
      <Page style={stylesPDF.page}>
        {/* Заголовок */}
        <Text style={stylesPDF.title}>Отчёт по заказу №{order.id}</Text>

        {/* Информация о заказе */}
        <View style={stylesPDF.infoBlock}>
          <Text>Дата заказа: <Text style={stylesPDF.bold}>{new Date(order.created_at).toLocaleDateString()}</Text></Text>
          <Text>Статус: <Text style={stylesPDF.bold}>{order.status}</Text></Text>
        </View>

        {/* Таблица товаров */}
        <Text style={[stylesPDF.tableTitle]}>Список товаров:</Text>
        <View style={stylesPDF.tableHeader}>
          <Text style={[stylesPDF.cell, stylesPDF.bold, { flex: 0.5 }]}>#</Text>
          <Text style={[stylesPDF.cell, stylesPDF.bold, { flex: 2 }]}>Наименование</Text>
          <Text style={[stylesPDF.cell, stylesPDF.bold]}>Кол-во</Text>
          <Text style={[stylesPDF.cell, stylesPDF.bold]}>Цена</Text>
          <Text style={[stylesPDF.cell, stylesPDF.bold]}>Срок годности</Text>
        </View>

        {order.items.map((item, index) => (
          <View style={stylesPDF.tableRow} key={index}>
            <Text style={[stylesPDF.cell, { flex: 0.5 }]}>{index + 1}</Text>
            <Text style={[stylesPDF.cell, { flex: 2 }]}>{item.name}</Text>
            <Text style={stylesPDF.cell}>{item.quantity}</Text>
            <Text style={stylesPDF.cell}>{item.price} сом</Text>
            <Text style={stylesPDF.cell}>
              {item.expiration_date
                ? new Date(item.expiration_date).toLocaleDateString()
                : '-'}
            </Text>
          </View>
        ))}

        {/* Итого */}
        <View style={stylesPDF.totalBlock}>
          <Text style={stylesPDF.totalText}>Итого: <Text style={stylesPDF.bold}>{total} сом</Text></Text>
        </View>
      </Page>
    </Document>
  );
}


function DetailedHistory() {
  const { order_id } = useParams();
  const { token } = useAuth();

  const [orderDetails, setOrderDetails] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!token || !order_id) return;

    const fetchOrderData = async () => {
      setLoading(true);
      try {
        const res = await fetch(
          'http://api.dustipharma.tj:1212/api/v1/app/orders/customer',
          {
            headers: {
              'Content-Type': 'application/json',
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();

        if (data?.code === 200 && Array.isArray(data.payload)) {
          const foundOrder = data.payload.find(
            (order) => order.id.toString() === order_id.toString()
          );
          setOrderDetails(foundOrder || null);
        } else {
          setOrderDetails(null);
        }
      } catch (error) {
        console.error('Ошибка при загрузке данных:', error);
        setOrderDetails(null);
      } finally {
        setLoading(false);
      }
    };

    fetchOrderData();
  }, [order_id, token]);

  const getTotalPrice = (items = []) =>
    items.reduce((sum, item) => sum + item.price * item.quantity, 0);

  const downloadPDF = async (order) => {
    const blob = await pdf(<OrderPDFDocument order={order} />).toBlob();
    saveAs(blob, `Заказ_${order.id}.pdf`);
  };

  const downloadExcel = (order) => {
    const data = [
      ['#', 'Товар', 'Количество', 'Цена', 'Срок годности'],
      ...order.items.map(({ name, quantity, price, expiration_date }, i) => [
        i + 1,
        name,
        quantity,
        price,
        expiration_date ? new Date(expiration_date).toLocaleDateString() : '-',
      ]),
    ];

    const worksheet = XLSX.utils.aoa_to_sheet(data);
    const workbook = XLSX.utils.book_new();
    XLSX.utils.book_append_sheet(workbook, worksheet, 'Заказ');

    const excelBuffer = XLSX.write(workbook, {
      bookType: 'xlsx',
      type: 'array',
    });
    saveAs(
      new Blob([excelBuffer], { type: 'application/octet-stream' }),
      `Заказ_${order.id}.xlsx`
    );
  };

  const currentStatusKey = orderDetails
    ? STATUS_MAP[orderDetails.status] || 'issued'
    : 'issued';

  return (
    <div className="DetailedHistory">
      <OrderHeader />
      <div className="DetailedHistory_content bg_detailed">
        <div className="basket_back">
          <div className="examination_backspace">
            <Link to="/history-order">
              <MoveLeft stroke="#232323" /> Назад
            </Link>
          </div>
          <h1>Статус заявки</h1>
        </div>

        <div className="order_basket_step">
          {loading ? (
            <p>Загрузка...</p>
          ) : orderDetails ? (
            <div className="detailed_info">
              <div className="users_detailed order_bg detailed_bg">
                <div className="active_order">
                </div>
                <div className="order_info">
                  <OrderStep
                    icon={<CircleCheck />}
                    label="Оформлено"
                    stepKey="issued"
                    currentStatus={currentStatusKey}
                  />
                  <OrderStep
                    icon={<Clock3 />}
                    label="В обработке"
                    stepKey="pending"
                    currentStatus={currentStatusKey}
                  />
                  <OrderStep
                    icon={<Package />}
                    label="В процессе сборки"
                    stepKey="assembled"
                    currentStatus={currentStatusKey}
                  />
                  <OrderStep
                    icon={<Truck />}
                    label="В процессе доставки"
                    stepKey="delivered"
                    currentStatus={currentStatusKey}
                  />
                  <OrderStep
                    icon={<CircleCheck />}
                    label="Доставлен"
                    stepKey="completed"
                    currentStatus={currentStatusKey}
                    isLast
                  />
                </div>

                <div className="report-buttons">
                  <button onClick={() => downloadPDF(orderDetails)}>Скачать PDF</button>
                  <button onClick={() => downloadExcel(orderDetails)}>Скачать Excel</button>
                </div>
              </div>
            </div>
          ) : (
            <p>Данные заказа не найдены.</p>
          )}
        </div>
      </div>
    </div>
  );
}

function OrderStep({ icon, label, stepKey, currentStatus, isLast = false }) {
  const currentIndex = STATUS_ORDER.indexOf(currentStatus);
  const stepIndex = STATUS_ORDER.indexOf(stepKey);
  const isReached = stepIndex !== -1 && currentIndex !== -1 && stepIndex <= currentIndex;

  return (
    <div className={`order-step ${isReached ? STATUS_COLOR_MAP[stepKey] : 'color-gray'}`}>
      <div className="order-step-icon">{icon}</div>
      <span className="order-step-label">{label}</span>
      {!isLast && <div className="order-step-line" />}
    </div>
  );
}

export default DetailedHistory;

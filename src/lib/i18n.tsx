import React, { createContext, useContext, useState, ReactNode } from 'react';

type Language = 'en' | 'es';

interface Translations {
  [key: string]: {
    [key in Language]: string;
  };
}

export const translations: Translations = {
  // Sidebar
  'nav.dashboard': { en: 'Dashboard', es: 'Panel' },
  'nav.inventory': { en: 'Inventory', es: 'Inventario' },
  'nav.pos': { en: 'Point of Sale', es: 'Punto de Venta' },
  'nav.payroll': { en: 'Payroll', es: 'Nómina' },
  'nav.purchases': { en: 'Purchases', es: 'Compras' },
  'nav.admin': { en: 'Admin', es: 'Admin' },
  'nav.billing': { en: 'Billing', es: 'Facturación' },
  'nav.audit': { en: 'Audit Logs', es: 'Auditoría' },
  'nav.settings': { en: 'Settings', es: 'Ajustes' },

  // Dashboard
  'dash.revenue': { en: 'Revenue (30d)', es: 'Ingresos (30d)' },
  'dash.inventory_value': { en: 'Inventory Value', es: 'Valor de Inventario' },
  'dash.active_orders': { en: 'Active Orders', es: 'Órdenes Activas' },
  'dash.low_stock': { en: 'Low Stock Items', es: 'Artículos con bajo stock' },
  'dash.overview': { en: 'Revenue Overview', es: 'Vista General de Ingresos' },
  'dash.weekly_data': { en: 'Weekly performance data', es: 'Datos de rendimiento semanal' },
  'dash.top_selling': { en: 'Top Selling Products', es: 'Productos más vendidos' },
  'dash.recent_transactions': { en: 'Recent Transactions', es: 'Transacciones Recientes' },
  'dash.cash_flow': { en: 'Cash Flow (Recent)', es: 'Flujo de Caja (Reciente)' },
  'dash.view_all': { en: 'View All', es: 'Ver Todo' },
  'dash.no_sales': { en: 'No sales data yet', es: 'Sin datos de ventas aún' },
  'dash.no_transactions': { en: 'No recent transactions', es: 'Sin transacciones recientes' },
  'dash.no_cashflow': { en: 'No cash flow data', es: 'Sin datos de flujo de caja' },

  // Inventory
  'inv.title': { en: 'Inventory', es: 'Inventario' },
  'inv.subtitle': { en: 'Manage your products and stock levels', es: 'Gestiona tus productos y niveles de stock' },
  'inv.add_product': { en: 'Add Product', es: 'Añadir Producto' },
  'inv.search_placeholder': { en: 'Search by SKU, name, or category...', es: 'Buscar por SKU, nombre o categoría...' },
  'inv.filters': { en: 'Filters', es: 'Filtros' },
  'inv.sku': { en: 'SKU', es: 'SKU' },
  'inv.name': { en: 'Product Name', es: 'Nombre del Producto' },
  'inv.category': { en: 'Category', es: 'Categoría' },
  'inv.price': { en: 'Price', es: 'Precio' },
  'inv.stock': { en: 'Stock', es: 'Stock' },
  'inv.status': { en: 'Status', es: 'Estado' },
  'inv.in_stock': { en: 'In Stock', es: 'En Stock' },
  'inv.low_stock': { en: 'Low Stock', es: 'Stock Bajo' },
  'inv.out_of_stock': { en: 'Out of Stock', es: 'Sin Stock' },
  'inv.min_stock': { en: 'Min Stock', es: 'Stock Mín.' },
  'inv.save': { en: 'Save Product', es: 'Guardar Producto' },
  'inv.cancel': { en: 'Cancel', es: 'Cancelar' },
  'inv.add_new': { en: 'Add New Product', es: 'Añadir Nuevo Producto' },

  // POS
  'pos.search': { en: 'Search products by SKU or name...', es: 'Buscar productos por SKU o nombre...' },
  'pos.cart': { en: 'Cart', es: 'Carrito' },
  'pos.items': { en: 'Items', es: 'Artículos' },
  'pos.summary': { en: 'Order Summary', es: 'Resumen del Pedido' },
  'pos.empty': { en: 'Cart is empty', es: 'El carrito está vacío' },
  'pos.subtotal': { en: 'Subtotal', es: 'Subtotal' },
  'pos.tax': { en: 'Tax', es: 'Impuestos' },
  'pos.total': { en: 'Total', es: 'Total' },
  'pos.checkout': { en: 'Process Payment', es: 'Procesar Pago' },
  'pos.success': { en: 'Transaction successful!', es: '¡Transacción exitosa!' },
  'pos.discount': { en: 'Discount', es: 'Descuento' },
  'pos.global_discount': { en: 'Global Discount (%)', es: 'Descuento Global (%)' },
  'pos.item_discount': { en: 'Item Discount', es: 'Desc. Item' },
  'pos.customer': { en: 'Customer', es: 'Cliente' },
  'pos.select_customer': { en: 'Select Customer', es: 'Seleccionar Cliente' },
  'pos.walk_in': { en: 'Walk-in Customer', es: 'Cliente General' },
  'pos.apply': { en: 'Apply', es: 'Aplicar' },
  'pos.shortcuts': { en: 'Shortcuts: F2 Search | F8 Pay', es: 'Atajos: F2 Buscar | F8 Pagar' },
  'pos.opening_amount': { en: 'Opening Amount', es: 'Monto Inicial' },
  'pos.open_session': { en: 'Open Cash Session', es: 'Abrir Turno de Caja' },
  'pos.close_session': { en: 'Close Session', es: 'Cerrar Turno' },
  'pos.session_required': { en: 'A cash session is required to process sales.', es: 'Se requiere un turno de caja para procesar ventas.' },
  'pos.payment_method': { en: 'Payment Method', es: 'Método de Pago' },
  'pos.cash': { en: 'Cash', es: 'Efectivo' },
  'pos.card': { en: 'Card', es: 'Tarjeta' },
  'pos.transfer': { en: 'Transfer', es: 'Transferencia' },
  'pos.received': { en: 'Received Amount', es: 'Monto Recibido' },
  'pos.change': { en: 'Change', es: 'Cambio' },
  'pos.declared_amount': { en: 'Declared Amount', es: 'Monto Declarado' },
  'pos.expected': { en: 'Expected', es: 'Esperado' },
  'pos.difference': { en: 'Difference', es: 'Diferencia' },
  'pos.confirm_close': { en: 'Are you sure you want to close the session?', es: '¿Estás seguro de que deseas cerrar el turno?' },
  'pos.print_ticket': { en: 'Print Ticket', es: 'Imprimir Ticket' },

  // Payroll
  'pay.title': { en: 'Payroll Management', es: 'Gestión de Nómina' },
  'pay.subtitle': { en: 'Manage employee salaries and payments', es: 'Gestionar salarios y pagos de empleados' },
  'pay.generate': { en: 'Generate Payroll', es: 'Generar Nómina' },
  'pay.total_payout': { en: 'Total Payout', es: 'Total a Pagar' },
  'pay.active_employees': { en: 'Active Employees', es: 'Empleados Activos' },
  'pay.next_payment': { en: 'Next Payment', es: 'Próximo Pago' },
  'pay.employee': { en: 'Employee', es: 'Empleado' },
  'pay.period': { en: 'Period', es: 'Periodo' },
  'pay.base': { en: 'Base Salary', es: 'Salario Base' },
  'pay.bonus': { en: 'Bonuses', es: 'Bonos' },
  'pay.deductions': { en: 'Deductions', es: 'Deducciones' },
  'pay.net_salary': { en: 'Net Salary', es: 'Salario Neto' },
  'pay.actions': { en: 'Actions', es: 'Acciones' },
  'pay.no_records': { en: 'No payroll records found', es: 'No se encontraron registros de nómina' },
  'pay.add_employee': { en: 'Add Employee', es: 'Añadir Empleado' },
  'pay.name': { en: 'Full Name', es: 'Nombre Completo' },
  'pay.position': { en: 'Position', es: 'Cargo' },
  'pay.bank_account': { en: 'Bank Account', es: 'Cuenta Bancaria' },
  'pay.confirm_payment': { en: 'Confirm Payment', es: 'Confirmar Pago' },
  'pay.pay_now': { en: 'Pay Now', es: 'Pagar Ahora' },
  'pay.status': { en: 'Status', es: 'Estado' },
  'pay.paid': { en: 'Paid', es: 'Pagado' },
  'pay.draft': { en: 'Draft', es: 'Borrador' },
  'pay.success_paid': { en: 'Payroll paid successfully', es: 'Nómina pagada con éxito' },
  'pay.period_select': { en: 'Select Period', es: 'Seleccionar Periodo' },
  'pay.calculate': { en: 'Calculate', es: 'Calcular' },
  'pay.confirm_msg': { en: 'Are you sure you want to process this payment?', es: '¿Estás seguro de que deseas procesar este pago?' },
  'pay.employees_list': { en: 'Employees List', es: 'Lista de Empleados' },
  'pay.download_pdf': { en: 'Download PDF Slip', es: 'Descargar PDF' },

  // Onboarding
  'onboarding.title': { en: 'Setup Your Organization', es: 'Configura tu Organización' },
  'onboarding.auth': { en: 'Create Account', es: 'Crear Cuenta' },
  'onboarding.company': { en: 'Company Details', es: 'Detalles de la Empresa' },
  'onboarding.ingestion': { en: 'Data Ingestion', es: 'Ingesta de Datos' },
  'onboarding.activation': { en: 'Activation', es: 'Activación' },
  'onboarding.email': { en: 'Email Address', es: 'Correo Electrónico' },
  'onboarding.password': { en: 'Password', es: 'Contraseña' },
  'onboarding.company_name': { en: 'Company Name', es: 'Nombre de la Empresa' },
  'onboarding.slug': { en: 'Unique Slug', es: 'Slug Único' },
  'onboarding.currency': { en: 'Currency', es: 'Moneda' },
  'onboarding.taxes': { en: 'Base Taxes (%)', es: 'Impuestos Base (%)' },
  'onboarding.csv_upload': { en: 'Upload Products CSV', es: 'Subir CSV de Productos' },
  'onboarding.csv_help': { en: 'Drag and drop your CSV file here or click to browse', es: 'Arrastra y suelta tu archivo CSV aquí o haz clic para buscar' },
  'onboarding.complete': { en: 'Complete Setup', es: 'Completar Configuración' },
  'onboarding.guide.title': { en: 'Getting Started Guide', es: 'Guía de Primeros Pasos' },
  'onboarding.guide.step1': { en: 'Create your first sale in POS', es: 'Crea tu primera venta en el POS' },
  'onboarding.guide.step2': { en: 'Add your first employee in Payroll', es: 'Añade tu primer empleado en Nómina' },
  'onboarding.guide.step3': { en: 'Check your inventory levels', es: 'Revisa tus niveles de inventario' },
  'onboarding.guide.welcome': { en: 'Welcome to Nexus! Follow these steps to get started.', es: '¡Bienvenido a Nexus! Sigue estos pasos para comenzar.' },
  'dash.dismiss': { en: 'Dismiss Guide', es: 'Cerrar Guía' },
  'dash.onboarding_active': { en: 'Onboarding Active', es: 'Onboarding Activo' },
  'dash.step': { en: 'STEP', es: 'PASO' },
  'dash.go_to_module': { en: 'Go to module', es: 'Ir al módulo' },
  'dash.sold': { en: 'sold', es: 'vendidos' },
  
  // Purchases
  'purchases.title': { en: 'Purchases & Inventory', es: 'Compras e Inventario' },
  'purchases.subtitle': { en: 'Manage supply chain and inventory costs.', es: 'Gestiona la cadena de suministro y los costos de inventario.' },
  'purchases.orders': { en: 'Purchase Orders', es: 'Órdenes de Compra' },
  'purchases.providers': { en: 'Providers', es: 'Proveedores' },
  'purchases.payable': { en: 'Accounts Payable', es: 'Cuentas por Pagar' },
  'purchases.new_order': { en: 'New Order', es: 'Nueva Orden' },
  'purchases.new_provider': { en: 'New Provider', es: 'Nuevo Proveedor' },
  'purchases.receive': { en: 'Receive Goods', es: 'Recibir Mercancía' },
  'purchases.number': { en: 'PO Number', es: 'Número de OC' },
  'purchases.provider': { en: 'Provider', es: 'Proveedor' },
  'purchases.amount': { en: 'Amount', es: 'Monto' },
  'purchases.total': { en: 'Total', es: 'Total' },
  'purchases.status': { en: 'Status', es: 'Estado' },
  'purchases.date': { en: 'Date', es: 'Fecha' },
  'purchases.items': { en: 'Items', es: 'Artículos' },
  'purchases.cost': { en: 'Cost', es: 'Costo' },
  'purchases.qty': { en: 'Qty', es: 'Cant.' },
  'purchases.received': { en: 'Received', es: 'Recibido' },
  'purchases.due_date': { en: 'Due Date', es: 'Fecha de Vencimiento' },
  'purchases.avg_cost': { en: 'Avg Cost', es: 'Costo Promedio' },
  'purchases.confirm_receive': { en: 'Confirm Reception', es: 'Confirmar Recepción' },
  'purchases.receive_msg': { en: 'Mark all items as received and update stock/costs?', es: '¿Marcar todos los artículos como recibidos y actualizar stock/costos?' },
  'purchases.no_email': { en: 'No email', es: 'Sin correo' },
  'purchases.orders_count': { en: 'Orders', es: 'Órdenes' },
  'purchases.payable_count': { en: 'Payable', es: 'Por pagar' },
  'purchases.select_provider': { en: 'Select Provider', es: 'Seleccionar Proveedor' },
  'purchases.qty_placeholder': { en: 'Qty', es: 'Cant.' },
  'purchases.cost_placeholder': { en: 'Cost', es: 'Costo' },
  'purchases.create_order': { en: 'Create Order', es: 'Crear Orden' },
  'purchases.cancel': { en: 'Cancel', es: 'Cancelar' },

  // Admin
  'admin.title': { en: 'Organization Settings', es: 'Ajustes de Organización' },
  'admin.subtitle': { en: 'Manage your organization and team', es: 'Gestiona tu organización y equipo' },
  'admin.general_config': { en: 'General Config', es: 'Configuración General' },
  'admin.org_name': { en: 'Organization Name', es: 'Nombre de la Organización' },
  'admin.tax_id': { en: 'Tax ID', es: 'ID Fiscal' },
  'admin.address': { en: 'Address', es: 'Dirección' },
  'admin.save_changes': { en: 'Save Changes', es: 'Guardar Cambios' },
  'admin.team_members': { en: 'Team Members', es: 'Miembros del Equipo' },
  'admin.invite': { en: 'Invite', es: 'Invitar' },
  'admin.edit': { en: 'Edit', es: 'Editar' },
  'admin.pro_plan': { en: 'Pro Plan', es: 'Plan Pro' },
  'admin.active_since': { en: 'Active since', es: 'Activo desde' },
  'admin.unlimited_users': { en: 'Unlimited Users', es: 'Usuarios Ilimitados' },
  'admin.custom_domains': { en: 'Custom Domains', es: 'Dominios Personalizados' },
  'admin.priority_support': { en: 'Priority Support', es: 'Soporte Prioritario' },
  'admin.manage_billing': { en: 'Manage Billing', es: 'Gestionar Facturación' },
  'admin.invitation_template': { en: 'Invitation Template', es: 'Plantilla de Invitación' },
  'admin.preview_email': { en: 'Preview the email sent to new members.', es: 'Vista previa del correo enviado a nuevos miembros.' },
  'admin.subject': { en: 'Subject', es: 'Asunto' },
  'admin.welcome_msg': { en: 'Welcome to', es: 'Bienvenido a' },
  'admin.invited_msg': { en: 'You have been invited to join', es: 'Has sido invitado a unirte a' },
  'admin.accept_msg': { en: 'Click below to accept:', es: 'Haz clic abajo para aceptar:' },
  'admin.accept_link': { en: '[Accept Invitation Link]', es: '[Enlace de Aceptación]' },
  'admin.regards': { en: 'Regards', es: 'Saludos' },
  'admin.team': { en: 'Team', es: 'Equipo' },

  // Audit
  'audit.title': { en: 'Audit Logs', es: 'Registros de Auditoría' },
  'audit.subtitle': { en: 'Traceability and history of all system actions', es: 'Trazabilidad e historial de todas las acciones del sistema' },
  'audit.search': { en: 'Search by action, user, or entity...', es: 'Buscar por acción, usuario o entidad...' },
  'audit.timestamp': { en: 'Timestamp', es: 'Fecha y Hora' },
  'audit.user': { en: 'User', es: 'Usuario' },
  'audit.action': { en: 'Action', es: 'Acción' },
  'audit.entity': { en: 'Entity', es: 'Entidad' },
  'audit.changes': { en: 'Changes', es: 'Cambios' },
  'audit.loading': { en: 'Loading audit logs...', es: 'Cargando registros de auditoría...' },
  'audit.no_logs': { en: 'No logs found', es: 'No se encontraron registros' },
  'audit.no_data': { en: 'No data', es: 'Sin datos' },

  // Billing
  'billing.title': { en: 'Billing & Subscription', es: 'Facturación y Suscripción' },
  'billing.subtitle': { en: 'Manage your plan and payment methods', es: 'Gestiona tu plan y métodos de pago' },
  'billing.current_plan': { en: 'Current Plan', es: 'Plan Actual' },
  'billing.month': { en: 'month', es: 'mes' },
  'billing.active': { en: 'Active', es: 'Activo' },
  'billing.upgrade': { en: 'Upgrade Now', es: 'Mejorar Ahora' },
  'billing.payment_method': { en: 'Payment Method', es: 'Método de Pago' },
  'billing.visa_ending': { en: 'Visa ending in', es: 'Visa terminada en' },
  'billing.expires': { en: 'Expires', es: 'Expira' },
  'billing.free_plan': { en: 'Free Plan', es: 'Plan Gratuito' },
  'billing.free_desc': { en: 'Perfect for small startups', es: 'Perfecto para pequeñas empresas' },
  'billing.pro_desc': { en: 'For scaling enterprises', es: 'Para empresas en crecimiento' },
  'billing.feat.products_100': { en: 'Up to 100 products', es: 'Hasta 100 productos' },
  'billing.feat.user_1': { en: '1 User', es: '1 Usuario' },
  'billing.feat.basic_analytics': { en: 'Basic Analytics', es: 'Analítica Básica' },
  'billing.feat.community_support': { en: 'Community Support', es: 'Soporte de la Comunidad' },
  'billing.feat.unlimited_products': { en: 'Unlimited products', es: 'Productos ilimitados' },
  'billing.feat.unlimited_users': { en: 'Unlimited Users', es: 'Usuarios ilimitados' },
  'billing.feat.advanced_audit': { en: 'Advanced Audit Logs', es: 'Auditoría Avanzada' },
  'billing.feat.priority_support': { en: 'Priority Support', es: 'Soporte Prioritario' },
  'billing.feat.custom_domains': { en: 'Custom Domains', es: 'Dominios Personalizados' },

  // Command Palette
  'cmd.search_placeholder': { en: 'Search modules, products, invoices...', es: 'Buscar módulos, productos, facturas...' },
  'cmd.no_results': { en: 'No results found.', es: 'No se encontraron resultados.' },
  'cmd.esc_close': { en: 'ESC to close', es: 'ESC para cerrar' },
  'cmd.navigation': { en: 'Navigation', es: 'Navegación' },
  'cmd.settings': { en: 'Settings', es: 'Ajustes' },

  // Onboarding Extra
  'onboarding.trial_msg': { en: 'Start your 14-day free trial. No credit card required.', es: 'Comienza tu prueba gratuita de 14 días. Sin tarjeta de crédito.' },
  'onboarding.infra_msg': { en: 'Tell us about your business infrastructure.', es: 'Cuéntanos sobre la infraestructura de tu negocio.' },
  'onboarding.import_msg': { en: 'Import your existing product catalog via CSV.', es: 'Importa tu catálogo de productos existente mediante CSV.' },
  'onboarding.ready_msg': { en: 'Your infrastructure is ready. Welcome to the future of enterprise management.', es: 'Tu infraestructura está lista. Bienvenido al futuro de la gestión empresarial.' },
  'onboarding.org_label': { en: 'Organization', es: 'Organización' },
  'onboarding.plan_label': { en: 'Plan', es: 'Plan' },
  'onboarding.trial_label': { en: 'Free Trial (14 Days)', es: 'Prueba Gratuita (14 Días)' },
  'onboarding.back': { en: 'Back', es: 'Atrás' },
  'onboarding.next': { en: 'Next Step', es: 'Siguiente Paso' },

  // Landing
  'land.features': { en: 'Features', es: 'Funciones' },
  'land.pricing': { en: 'Pricing', es: 'Precios' },
  'land.about': { en: 'About', es: 'Nosotros' },
  'land.get_started': { en: 'Get Started', es: 'Comenzar' },
  'land.hero_tag': { en: 'The Future of ERP', es: 'El Futuro del ERP' },
  'land.hero_title': { en: 'Precision\nEfficiency\nFor Your\nBusiness.', es: 'Precisión\nEficiencia\nPara tu\nNegocio.' },
  'land.hero_subtitle': { en: 'The minimalist ERP for architects of industry. Inventory, POS, Payroll, and Admin—all in one place.', es: 'El ERP minimalista para arquitectos de la industria. Inventario, POS, Nómina y Administración—todo en un solo lugar.' },
  'land.start_trial': { en: 'Start Free Trial', es: 'Iniciar Prueba Gratis' },
  'land.view_demo': { en: 'View Demo', es: 'Ver Demo' },
  'land.core_modules': { en: 'Core Modules', es: 'Módulos Principales' },
  'land.pos_title': { en: 'POS SYSTEM', es: 'SISTEMA POS' },
  'land.pos_desc': { en: 'High-speed transactions with atomic stock updates.', es: 'Transacciones de alta velocidad con actualizaciones de stock atómicas.' },
  'land.audit_title': { en: 'AUDIT LOGS', es: 'REGISTROS DE AUDITORÍA' },
  'land.audit_desc': { en: 'Every change tracked. Full transparency for your org.', es: 'Cada cambio rastreado. Transparencia total para tu organización.' },
  'land.kpi_title': { en: 'REAL-TIME KPI', es: 'KPI EN TIEMPO REAL' },
  'land.kpi_desc': { en: 'Clean data visualizations for clear decision making.', es: 'Visualizaciones de datos limpias para una toma de decisiones clara.' },
  'land.free_desc': { en: 'For small teams starting out.', es: 'Para equipos pequeños que están comenzando.' },
  'land.pro_desc': { en: 'For scaling enterprises.', es: 'Para empresas en crecimiento.' },
  'land.current_plan': { en: 'Current Plan', es: 'Plan Actual' },
  'land.go_pro': { en: 'Go Pro', es: 'Pasar a Pro' },
  'land.rights': { en: 'ALL RIGHTS RESERVED.', es: 'TODOS LOS DERECHOS RESERVADOS.' },

  'common.loading': { en: 'Loading...', es: 'Cargando...' },
  'common.usd': { en: 'USD - US Dollar', es: 'USD - Dólar Estadounidense' },
  'common.eur': { en: 'EUR - Euro', es: 'EUR - Euro' },
  'common.mxn': { en: 'MXN - Mexican Peso', es: 'MXN - Peso Mexicano' },
  'common.system': { en: 'System', es: 'Sistema' },
  'common.enterprise_core': { en: 'Enterprise Core', es: 'Núcleo Empresarial' },
  'common.current_plan': { en: 'Current Plan', es: 'Plan Actual' },
};

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [language, setLanguage] = useState<Language>('es'); // Default to Spanish

  const t = (key: string) => {
    return translations[key]?.[language] || key;
  };

  return (
    <LanguageContext.Provider value={{ language, setLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (context === undefined) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}

import router from '@/router';

export const getRutas = (rutas:any) => {
    const hasMenu = (menuItem: any) => rutas ? rutas.includes(menuItem) : false

    return [
        {
            label: 'Monitoreo',
            visible: hasMenu('MOER'),
            items: [
                {
                    label: 'Consola de Soporte al Negocio',
                    command: () => { router.push({ name: 'SONE' }); },
                    visible: hasMenu('SONE')
                }
            ]
        },
        {
            label: 'Administración',
            visible: hasMenu('ABMV'),
            items: [
                {
                    label: 'Gestión de Operadores',
                    command: () => { router.push({ name: 'GEOP' }); },
                    visible: hasMenu('GEOP')
                },
                {
                    label: 'Gestión de Estructuras Logísticas',
                    command: () => { router.push({ name: 'ESLO' }); },
                    visible: hasMenu('ESLO')
                },
                {
                    label: 'Administración de Perfiles',
                    command: () => { router.push({ name: 'ABMP' }); },
                    visible: hasMenu('ABMP')
                },
                {
                    label: 'Consulta de Estructuras Logisticas',
                    command: () => { router.push({ name: 'CESL' }); },
                    visible: hasMenu('CESL')
                },
                {
                    label: 'Emulación',
                    command: () => { router.push({ name: 'EMUL' }); },
                    visible: hasMenu('EMUL')
                }
            ]
        },
        {
            label: 'Gestión de Materiales',
            visible: hasMenu('GEMA'),
            items: [
                {
                    label: 'Gestionar Materiales en OTs',
                    command: () => { router.push({ name: 'GEOT' }); },
                    visible: hasMenu('GEOT')
                },
                {
                    label: 'Errores de Gestión',
                    command: () => { router.push({ name: 'ERGE' }); },
                    visible: hasMenu('ERGE')
                },
                {
                    label: 'Registro de OTs Fallidas',
                    command: () => { router.push({ name: 'REFA' }); },
                    visible: hasMenu('REFA')
                },
                {
                    label: 'Materiales Descargados',
                    command: () => { router.push({ name: 'MADE' }); },
                    visible: hasMenu('MADE')
                },
                {
                    label: 'Errores de Gestión Sucursal',
                    command: () => { router.push({ name: 'ERGS' }); },
                    visible: hasMenu('ERGS')
                },
                {
                    label: 'Validación OT de Redes',
                    command: () => { router.push({ name: 'VARE' }); },
                    visible: hasMenu('VARE')
                }
            ]
        },
        {
            label: 'GDA Operaciones DDD',
            visible: hasMenu('GDAO'),
            items: [
                {
                    label: 'Configuración QRTZ',
                    command: () => { router.push({ name: 'QRTZ' }); },
                    visible: hasMenu('QRTZ')
                }
            ]
        },
        {
            label: 'Reportes',
            visible: hasMenu('REPO'),
            items: [
                {
                    label: 'Extracción de Datos GM',
                    command: () => { router.push({ name: 'EXDA' }); },
                    visible: hasMenu('EXDA')
                }
            ]
        },
        {
            label: 'Ordenes Trabajo',
            visible: hasMenu('OT  '),
            items: [
                {
                    label: 'Busqueda en Zona',
                    command: () => { router.push({ name: 'OTZO' }); },
                    visible: hasMenu('OTZO')
                },
                {
                    label: 'Busqueda en Mapa',
                    command: () => { router.push({ name: 'OMAP' }); },
                    visible: hasMenu('OMAP')
                }
            ]
        },
        {
            label: 'Certificación Contratista',
            visible: hasMenu('CECO'),
            items: [
                {
                    label: 'WorkAround',
                    command: () => { router.push({ name: 'WOAR' }); },
                    visible: hasMenu('WOAR')
                },
                {
                    label: 'Parametrizaciones',
                    visible: hasMenu('PARA'),
                    items: [
                        {
                            label: 'Configuración Jobtype-Contrato',
                            command: () => { router.push({ name: 'JOCO' }); },
                            visible: hasMenu('JOCO')
                        },
                        {
                            label: 'Configuración CMO-Actividad',
                            command: () => { router.push({ name: 'CMOA' }); },
                            visible: hasMenu('CMOA')
                        }
                    ]
                },
                {
                    label: 'Gestión de Actas',
                    visible: hasMenu('GEAC'),
                    items: [
                        {
                            label: 'Consultar Actas',
                            command: () => { router.push({ name: 'COAC' }); },
                            visible: hasMenu('COAC')
                        },
                        {
                            label: 'Consultar OTs Sin ACTA',
                            command: () => { router.push({ name: 'COSA' }); },
                            visible: hasMenu('COSA')
                        },
                        {
                            label: 'Consultar Notas de Débito',
                            command: () => { router.push({ name: 'NODE' }); },
                            visible: hasMenu('NODE')
                        },
                        {
                            label: 'Consultar Notas de Crédito',
                            command: () => { router.push({ name: 'NOCR' }); },
                            visible: hasMenu('NOCR')
                        }
                    ]
                },
                {
                    label: 'Gestión de Reglas',
                    visible: hasMenu('GERE'),
                    items: [
                        {
                            label: 'Consultar Reglas',
                            command: () => { router.push({ name: 'CORE' }); },
                            visible: hasMenu('CORE')
                        },
                        {
                            label: 'Monitoreo y Ejecución de Reglas',
                            command: () => { router.push({ name: 'MORE' }); },
                            visible: hasMenu('MORE')
                        },
                        {
                            label: 'Regla Prueba Masiva',
                            command: () => { router.push({ name: 'PUMA' }); },
                            visible: hasMenu('PUMA')
                        }
                    ]
                },
                {
                    label: 'Registro OTs Fallidas',
                    command: () => { router.push({ name: 'ROTF' }); },
                    visible: hasMenu('ROTF')
                },
                {
                    label: 'Búsqueda de Ots',
                    command: () => { router.push({ name: 'BUOT' }); },
                    visible: hasMenu('BUOT')
                }
            ]
        }
    ];
}
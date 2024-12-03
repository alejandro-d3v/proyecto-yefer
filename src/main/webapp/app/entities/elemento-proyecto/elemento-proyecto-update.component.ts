import { computed, defineComponent, inject, ref, type Ref } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute, useRouter } from 'vue-router';
import { useVuelidate } from '@vuelidate/core';

import ElementoProyectoService from './elemento-proyecto.service';
import useDataUtils from '@/shared/data/data-utils.service';
import { useValidation } from '@/shared/composables';
import { useAlertService } from '@/shared/alert/alert.service';

import ElementoService from '@/entities/elemento/elemento.service';
import { type IElemento } from '@/shared/model/elemento.model';
import { type IElementoProyecto, ElementoProyecto } from '@/shared/model/elemento-proyecto.model';
import Editor from '@tinymce/tinymce-vue';
import axios from 'axios';

interface BlobInfo {
  blob: () => Blob; // Método que devuelve un Blob
  filename: () => string; // Método que devuelve el nombre del archivo
}
export default defineComponent({
  compatConfig: { MODE: 3 },
  name: 'ElementoProyectoUpdate',
  components: {
    Editor, // Registrar TinyMCE
  },
  setup() {
    const elementoProyectoService = inject('elementoProyectoService', () => new ElementoProyectoService());
    const alertService = inject('alertService', () => useAlertService(), true);

    const elementoProyecto: Ref<IElementoProyecto> = ref(new ElementoProyecto());

    const elementoService = inject('elementoService', () => new ElementoService());

    const elementos: Ref<IElemento[]> = ref([]);
    const isSaving = ref(false);
    const currentLanguage = inject('currentLanguage', () => computed(() => navigator.language ?? 'es'), true);

    const route = useRoute();
    const router = useRouter();

    const previousState = () => router.go(-1);

    const retrieveElementoProyecto = async elementoProyectoId => {
      try {
        const res = await elementoProyectoService().find(elementoProyectoId);

        elementoProyecto.value = res;
        console.log('Contenido recuperado:', elementoProyecto.value.dato);
      } catch (error) {
        alertService.showHttpError(error.response);
      }
    };

    if (route.params?.elementoProyectoId) {
      retrieveElementoProyecto(route.params.elementoProyectoId);
    }

    const initRelationships = () => {
      elementoService()
        .retrieve()
        .then(res => {
          elementos.value = res.data;
        });
    };

    initRelationships();

    const dataUtils = useDataUtils();

    const { t: t$ } = useI18n();
    const validations = useValidation();
    const validationRules = {
      dato: {},
      descripcion: {},
      elemento: {},
    };
    const v$ = useVuelidate(validationRules, elementoProyecto as any);
    v$.value.$validate();

    // Definir el método de carga de imágenes

    const imageUpload = (blobInfo: any, progress: (percent: number) => void): Promise<string> => {
      return new Promise(async (resolve, reject) => {
        const formData = new FormData();
        formData.append('file', blobInfo.blob(), blobInfo.filename());

        try {
          //const token = localStorage.getItem('jwt_token');
          const response = await axios.post('api/elemento-proyectos/upload/image', formData, {
            //headers: {
            //  'Content-Type': 'multipart/form-data',
            //  Authorization: `Bearer ${token}`,
            //},
            onUploadProgress: event => {
              if (event.total) {
                progress((event.loaded / event.total) * 100); // Actualiza el progreso
              }
            },
          });

          // Extrae la URL de la respuesta del backend

          const imageUrl = response.data?.src;
          if (imageUrl) {
            resolve(imageUrl); // Resuelve la promesa con la URL de la imagen
          } else {
            reject('No se pudo obtener la URL de la imagen.');
          }
        } catch (error: any) {
          console.error('Error al cargar la imagen:', error);
          reject('Error al cargar la imagen: ' + (error.response?.data?.message || error.message));
        }
      });
    };

    return {
      elementoProyectoService,
      alertService,
      elementoProyecto,
      previousState,
      isSaving,
      currentLanguage,
      elementos,
      ...dataUtils,
      v$,
      t$,
      imageUpload,
    };
  },
  created(): void {},
  methods: {
    save(): void {
      this.isSaving = true;
      if (this.elementoProyecto.id) {
        const contenido = this.elementoProyecto;
        console.log('Contenido del editor:', contenido);
        this.elementoProyectoService()
          .update(this.elementoProyecto)
          .then(param => {
            this.isSaving = false;

            console.log('actualizando');
            console.log(param);
            this.previousState();
            this.alertService.showInfo(this.t$('ciecytApp.elementoProyecto.updated', { param: param.id }));
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      } else {
        this.elementoProyectoService()
          .create(this.elementoProyecto)
          .then(param => {
            this.isSaving = false;
            this.previousState();
            console.log('guardando');
            this.alertService.showSuccess(this.t$('ciecytApp.elementoProyecto.created', { param: param.id }).toString());
          })
          .catch(error => {
            this.isSaving = false;
            this.alertService.showHttpError(error.response);
          });
      }
    },
  },
});

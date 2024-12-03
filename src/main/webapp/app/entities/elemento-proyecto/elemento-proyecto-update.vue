<template>
  <div class="row justify-content-center">
    <div class="col-8">
      <form name="editForm" novalidate v-on:submit.prevent="save()">
        <h2
          id="ciecytApp.elementoProyecto.home.createOrEditLabel"
          data-cy="ElementoProyectoCreateUpdateHeading"
          v-text="t$('ciecytApp.elementoProyecto.home.createOrEditLabel')"
        ></h2>
        <div>
          <div class="form-group" v-if="elementoProyecto.id">
            <label for="id" v-text="t$('global.field.id')"></label>
            <input type="text" class="form-control" id="id" name="id" v-model="elementoProyecto.id" readonly />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('ciecytApp.elementoProyecto.dato')" for="elemento-proyecto-dato"></label>
            <Editor
              id="elemento-proyecto-dato"
              api-key="ugf2fm74q3nvz5qz4lt7rz32dviqga8ryv7luxfv18knay2m"
              v-model="elementoProyecto.dato"
              :init="{
                height: 500,
                menubar: false,
                plugins: 'image code',
                toolbar: 'undo redo | styleselect | bold italic | image | code',
                images_upload_handler: imageUpload,
                setup: editor => {
                  // Asegura que el contenido se sincroniza con el modelo de Vue
                  editor.on('Change', () => {
                    // Este código sincroniza el contenido con el modelo elementoProyecto.dato
                    elementoProyecto.dato = editor.getContent();
                  });
                },
              }"
              :class="{ valid: !v$.dato?.$invalid, invalid: v$.dato?.$invalid }"
            >
            </Editor>
          </div>
          <div class="form-group">
            <label
              class="form-control-label"
              v-text="t$('ciecytApp.elementoProyecto.descripcion')"
              for="elemento-proyecto-descripcion"
            ></label>
            <input
              type="text"
              class="form-control"
              name="descripcion"
              id="elemento-proyecto-descripcion"
              data-cy="descripcion"
              :class="{ valid: !v$.descripcion.$invalid, invalid: v$.descripcion.$invalid }"
              v-model="v$.descripcion.$model"
            />
          </div>
          <div class="form-group">
            <label class="form-control-label" v-text="t$('ciecytApp.elementoProyecto.elemento')" for="elemento-proyecto-elemento"></label>
            <select
              class="form-control"
              id="elemento-proyecto-elemento"
              data-cy="elemento"
              name="elemento"
              v-model="elementoProyecto.elemento"
            >
              <option v-bind:value="null"></option>
              <option
                v-bind:value="
                  elementoProyecto.elemento && elementoOption.id === elementoProyecto.elemento.id
                    ? elementoProyecto.elemento
                    : elementoOption
                "
                v-for="elementoOption in elementos"
                :key="elementoOption.id"
              >
                {{ elementoOption.id }}
              </option>
            </select>
          </div>
        </div>
        <div>
          <button type="button" id="cancel-save" data-cy="entityCreateCancelButton" class="btn btn-secondary" v-on:click="previousState()">
            <font-awesome-icon icon="ban"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.cancel')"></span>
          </button>
          <button
            type="submit"
            id="save-entity"
            data-cy="entityCreateSaveButton"
            :disabled="v$.$invalid || isSaving"
            class="btn btn-primary"
          >
            <font-awesome-icon icon="save"></font-awesome-icon>&nbsp;<span v-text="t$('entity.action.save')"></span>
          </button>
        </div>
      </form>
    </div>
  </div>
</template>

<script lang="ts" src="./elemento-proyecto-update.component.ts"></script>

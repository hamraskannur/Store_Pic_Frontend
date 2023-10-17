import { Component,Output,EventEmitter } from '@angular/core';
import { ApiService } from '../../../services/api.service';
import { HttpEventType } from '@angular/common/http';
import { Image } from 'src/app/core/models/interceptors';

@Component({
  selector: 'app-upload-image',
  templateUrl: './upload-image.component.html',
  styleUrls: ['./upload-image.component.css'],
})
export class UploadImageComponent {
  fileProgress: number = 0;
  selectedImage: string | ArrayBuffer | null = null;
  file: File | null = null;
  startUpload = false;
  errorMessage = '';
  @Output() addImage: EventEmitter<Image> = new EventEmitter<Image>();

  constructor(private ApiService: ApiService) {}

  fileSelectHandler(e: Event) {
    e.preventDefault();
    e.stopPropagation();
    const fileInput = e.target as HTMLInputElement;
    if (fileInput.files && fileInput.files.length > 0) {
      this.file = fileInput.files[0];
      if (this.file.type.startsWith('image/')) {
        const maxSizeInBytes = 10 * 1024 * 1024; // 10 MB in bytes
        if (this.file.size <= maxSizeInBytes) {
          const reader = new FileReader();
          reader.onload = () => {
            this.selectedImage = reader.result;
          };
          reader.readAsDataURL(this.file);
        } else {
          this.errorMessage =
            'Please select an image that is 10 MB or smaller.';
        }
      } else {
        this.errorMessage = 'plase select image';
      }
    }
  }

  uploadFiles() {
    this.startUpload = true;
    this.fileProgress = 5;
    if (this.file) {
      const formData = new FormData();
      formData.append('image', this.file);
      this.ApiService.uploadImage(formData).subscribe((event) => {
        if (event.type === HttpEventType.UploadProgress && event.total) {
          this.fileProgress = Math.round((100 * event.loaded) / event.total);
        } else if (event.type === HttpEventType.Response ) {
          if(event.body){
            this.addImage.emit(event.body.image);
            this.startUpload=false
            this.fileProgress = 0;
          }

        }
      });
    }
  }
}
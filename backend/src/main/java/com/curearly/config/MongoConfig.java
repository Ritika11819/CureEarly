package com.curearly.config;

import com.mongodb.client.gridfs.GridFSBucket;
import com.mongodb.client.gridfs.GridFSBuckets;
import jakarta.annotation.PostConstruct;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.mongodb.MongoDatabaseFactory;
import org.springframework.data.mongodb.core.convert.MappingMongoConverter;

@Configuration
public class MongoConfig {

    private final MappingMongoConverter mappingMongoConverter;

    public MongoConfig(MappingMongoConverter mappingMongoConverter) {
        this.mappingMongoConverter = mappingMongoConverter;
    }

    @PostConstruct
    public void configureMongoConverter() {
        mappingMongoConverter.setMapKeyDotReplacement("_");
    }

    @Bean
    GridFSBucket gridFsBucket(MongoDatabaseFactory factory) {
        return GridFSBuckets.create(factory.getMongoDatabase());
    }
}